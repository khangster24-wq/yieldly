import { GoogleGenAI } from "@google/genai";

import { ADVISOR_SYSTEM_PROMPT, buildGroundingContext } from "@/lib/advisor-prompt";
import type { College, StudentProfile } from "@/lib/types";

export const runtime = "nodejs";

/** Fast, free-tier Gemini model — good fit for grounded Q&A like this. */
const ADVISOR_MODEL = "gemini-3.6-flash";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AdvisorRequest {
  messages: ChatMessage[];
  profile?: StudentProfile | null;
  portfolio?: College[];
}

/**
 * AI College Counselor endpoint (Phase 4). Runs on the free Gemini API tier —
 * the key is read from the GEMINI_API_KEY env var and never hardcoded
 * (docs/DATA_SOURCES.md). Until a key is set, this returns a friendly 503 so
 * the Advisor UI can show a designed "connect the counselor" state rather
 * than erroring out.
 *
 * Grounding: the student's real portfolio + profile are injected as context so
 * the model reasons over actual saved numbers, not hallucinations.
 */
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error: "advisor_unconfigured",
        message:
          "The AI counselor isn't connected yet. Add a GEMINI_API_KEY to .env.local to enable it.",
      },
      { status: 503 }
    );
  }

  let body: AdvisorRequest;
  try {
    body = (await req.json()) as AdvisorRequest;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return Response.json({ error: "no_messages" }, { status: 400 });
  }

  const grounding = buildGroundingContext(body.profile ?? null, body.portfolio ?? []);

  const client = new GoogleGenAI({ apiKey });

  try {
    // Stream the response so long answers don't hit request timeouts and the
    // chat UI can render tokens as they arrive.
    const stream = await client.models.generateContentStream({
      model: ADVISOR_MODEL,
      config: {
        systemInstruction: `${ADVISOR_SYSTEM_PROMPT}\n\nHere is the student's current Yieldly data. Only cite numbers found here.\n\n${grounding}`,
      },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[The counselor hit a snag. Please try again.]")
          );
          console.error("Advisor stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Advisor request failed:", err);
    return Response.json(
      { error: "advisor_failed", message: "Could not reach the counselor." },
      { status: 502 }
    );
  }
}
