"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

import { LogoIcon } from "@/components/brand/logo";
import { getPortfolio, getProfile } from "@/lib/storage";
import { EMPTY_PROFILE, type College, type StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "How's my portfolio looking?",
  "Which scholarships should I prioritize?",
  "What's net price vs. sticker price?",
  "Am I too reach-heavy?",
];

const OFFLINE_MESSAGE =
  "I'm not connected yet — add a `GEMINI_API_KEY` to `.env.local` and restart, and I'll come online. Once I'm up, I can dig into your saved schools, your diversification, and which scholarships are worth your time.";

/**
 * The chat lives in memory only (never localStorage), so it already disappears
 * on refresh — but this is a single-page app, so a tab left open on /advisor
 * can accumulate an unbounded conversation. Two bounds keep that cheap:
 * an idle timeout that wipes a stale conversation, and a cap on how much
 * history gets sent to the model each turn (keeps requests fast and the
 * server's grounding-context rebuild from growing unbounded with the chat).
 */
const IDLE_CLEAR_MS = 30 * 60 * 1000; // 30 min inactive → auto-clear
const MAX_HISTORY_MESSAGES = 20; // ~10 exchanges of context sent to the model

/**
 * AI College Counselor chat (docs/FEATURES.md §4). Streams from /api/advisor,
 * which grounds the model in the student's real scored portfolio + scholarship
 * data. Degrades gracefully to a friendly "connect me" message when no API key
 * is configured — the chat UX stays intact either way.
 */
export function AdvisorExperience() {
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [portfolio, setPortfolio] = useState<College[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    setProfile(getProfile());
    setPortfolio(getPortfolio());
  }, []);

  // Keep the latest message in view as it streams.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // A tab left open on this page indefinitely shouldn't hold onto a stale
  // conversation forever — wipe it after a long stretch of inactivity.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastActivityRef.current > IDLE_CLEAR_MS) {
        setMessages((m) => (m.length > 0 ? [] : m));
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setInput("");
    lastActivityRef.current = Date.now();

    const history = [...messages, { role: "user" as const, content: trimmed }];
    // Append the user turn + an empty assistant turn we stream into.
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    const setLastAssistant = (content: string) =>
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content };
        return copy;
      });

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY_MESSAGES),
          profile,
          portfolio,
        }),
      });

      if (res.status === 503) {
        setLastAssistant(OFFLINE_MESSAGE);
        return;
      }
      if (!res.ok || !res.body) {
        setLastAssistant("Something went wrong reaching the counselor. Try again in a moment.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLastAssistant(acc);
      }
    } catch {
      setLastAssistant("Something went wrong reaching the counselor. Try again in a moment.");
    } finally {
      setStreaming(false);
      lastActivityRef.current = Date.now();
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Scrollable conversation */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <Welcome onPick={send} />
        ) : (
          <div className="space-y-3 pb-2">
            {messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                loading={
                  streaming && i === messages.length - 1 && m.role === "assistant" && m.content === ""
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-end gap-2 rounded-card border border-hairline bg-surface-card p-2 shadow-card transition-colors focus-within:border-yieldly-blue/50"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask about your list, scholarships, aid…"
          className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-navy outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-pill bg-brand-gradient text-white shadow-card transition-all active:scale-90 disabled:opacity-40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col items-center justify-center px-2 text-center"
    >
      <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
        <Sparkles className="size-7 text-white" strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-bold text-navy">Your finance-first counselor</h2>
      <p className="mt-1 max-w-[17rem] text-sm text-muted-foreground">
        I know your saved schools and scholarship matches. Ask me anything —
        I&apos;ll lead with the money.
      </p>
      <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-pill border border-hairline bg-surface-card px-4 py-2.5 text-left font-heading text-sm font-semibold text-navy shadow-card transition-all hover:border-yieldly-blue/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function Bubble({
  role,
  content,
  loading,
}: {
  role: "user" | "assistant";
  content: string;
  loading: boolean;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex items-end gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="mb-0.5 shrink-0">
          <LogoIcon size={26} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-card",
          isUser
            ? "rounded-br-md whitespace-pre-wrap bg-yieldly-blue text-white"
            : "rounded-bl-md border border-hairline bg-surface-card text-navy"
        )}
      >
        {loading ? <TypingDots /> : isUser ? content : <Markdown content={content} />}
      </div>
    </motion.div>
  );
}

const MARKDOWN_COMPONENTS: Components = {
  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  strong: ({ ...props }) => <strong className="font-heading font-bold text-navy" {...props} />,
  ul: ({ ...props }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0" {...props} />,
  ol: ({ ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0" {...props} />,
  li: ({ ...props }) => <li className="leading-snug" {...props} />,
  a: ({ ...props }) => (
    <a className="font-semibold text-yieldly-blue underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  h1: ({ ...props }) => <p className="mb-1 font-heading text-base font-bold text-navy" {...props} />,
  h2: ({ ...props }) => <p className="mb-1 font-heading text-base font-bold text-navy" {...props} />,
  h3: ({ ...props }) => <p className="mb-1 font-heading text-sm font-bold text-navy" {...props} />,
  code: ({ ...props }) => (
    <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[13px]" {...props} />
  ),
};

/** Renders the counselor's markdown (bold, lists, links) instead of raw asterisks. */
function Markdown({ content }: { content: string }) {
  return (
    <div className="[&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-pill bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}
