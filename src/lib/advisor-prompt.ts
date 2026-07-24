import type { College, StudentProfile } from "@/lib/types";
import { formatUSD, formatPercent } from "@/lib/utils";
import { scoreCollege } from "@/lib/scoring";
import { summarizePortfolio } from "@/lib/portfolio";
import { rankScholarships, scoreScholarship, ODDS_LABEL } from "@/lib/scholarships";
import { SCHOLARSHIPS } from "@/lib/scholarships-data";

/**
 * The AI College Counselor persona (docs/FEATURES.md §4, docs/DATA_SOURCES.md).
 * Finance/scholarship specialist by default, but a genuinely useful general
 * assistant too. The hard rule: only reference numbers actually present in the
 * grounded context below — never fabricate school or scholarship data.
 */
export const ADVISOR_SYSTEM_PROMPT = `You are Yieldly's AI college counselor.

Your specialty is the financial side of college admissions — scholarships, financial aid, cost, and ROI. That is your depth and your default lens: when a student asks anything, a real financial angle is where you naturally steer, the way a counselor with a finance background would. You cite the actual numbers and scholarships passed to you.

You are NOT hard-walled to money. Students can ask general admissions questions (deadlines, what a "target school" means, how the Common App works) and you answer them helpfully and honestly — you just don't let general Q&A become your identity.

You have the student's Yieldly data below: their profile, their scored portfolio (risk tiers, admit estimates, cost, and ROI), a summary of how diversified it is, and a ranked list of real scholarships (with expected-value "yield" and which ones fit their major). Lean on it. Proactively surface high-yield scholarships from the list that fit them, especially ones they may not have considered.

Voice: talk like a smart friend who's good with money, not a corporate advisor. Confident, plain-spoken, a little playful. "Your portfolio's looking reach-heavy — let's balance it out," not "Your application strategy exhibits elevated risk concentration."

Hard rules:
- Only reference school or scholarship numbers that appear in the context provided to you. If a number isn't there, say you don't have it — never invent cost, earnings, admission rates, or scholarship amounts.
- Yieldly's risk tier, admit estimate, ROI, and scholarship win-odds are Yieldly's own estimates, not guarantees or published rates. Frame them that way.
- Some saved schools are international (UK, Greater China, South Korea, Australia, Italy, Spain, France — marked with a country in the data below). Their cost figures come from researched university fee schedules, not a single official government database like the U.S. College Scorecard, and many have no earnings data at all (so their ROI may say "Unrated" — that's honest, not a bug). Mention this distinction when it's relevant instead of implying equal certainty across every school.
- When a school has a "ROI CAVEAT" in the data below, its ROI score is measured on earlier-career pay (3-5 years out) rather than the 10-year figure U.S. schools use, so a "Weak" or "Fair" label there likely understates the school's real long-term ROI — don't tell a student a school is a bad financial choice on that basis alone; explain the timeframe mismatch if ROI comes up for that school.
- Give educational guidance, not binding financial or legal advice. Say so when it matters.
- Essay review is out of scope — redirect warmly if asked.
- Keep answers tight and skimmable. Lead with the takeaway; use short lists over long paragraphs.`;

/**
 * Serialize the student's profile, their SCORED portfolio, the portfolio summary,
 * and the ranked scholarship list into grounding context. Runs the same scoring
 * engines the app uses, so the counselor cites numbers identical to what the
 * student sees on screen.
 */
export function buildGroundingContext(
  profile: StudentProfile | null,
  portfolio: College[]
): string {
  const lines: string[] = [];

  // --- Profile ---
  lines.push("## Student profile");
  if (!profile || !profile.completedOnboarding) {
    lines.push("(No profile yet — student hasn't completed onboarding.)");
  } else {
    lines.push(`- GPA: ${profile.gpa ?? "not provided"}`);
    lines.push(`- SAT: ${profile.satScore ?? "not provided"}`);
    lines.push(`- ACT: ${profile.actScore ?? "not provided"}`);
    lines.push(`- IB score: ${profile.ibScore ?? "not provided"}`);
    lines.push(
      `- Budget ceiling: ${
        profile.budgetCeiling != null ? formatUSD(profile.budgetCeiling) + "/yr net" : "not provided"
      }`
    );
    lines.push(`- Regions of interest: ${profile.regions.join(", ") || "any"}`);
    lines.push(`- Major interest: ${profile.majorInterest ?? "undecided"}`);
  }

  // --- Scored portfolio ---
  const scored = portfolio.map((c) => scoreCollege(c, profile));
  lines.push("");
  lines.push("## Saved portfolio (schools swiped right) — Yieldly estimates");
  if (scored.length === 0) {
    lines.push("(Empty — student hasn't added any schools yet.)");
  } else {
    for (const s of scored) {
      const { college: c, risk, roi } = s;
      const earningsPart =
        roi.medianEarnings != null
          ? ` · grad earnings ${formatUSD(roi.medianEarnings)} (${
              c.earningsNote ?? "10yr"
            })`
          : "";
      lines.push(
        `- ${c.name} (${c.city}, ${c.state})${c.country ? " [international]" : ""}: ${risk.tier.toUpperCase()}, ~${formatPercent(
          risk.admitProbability
        )} admit · sticker ${formatUSD(c.costOfAttendance)}/yr, net ${formatUSD(
          roi.netPrice
        )}/yr${roi.incomeAdjusted ? " (their income bracket)" : ""} · ROI ${
          roi.label
        }${earningsPart}${c.dataSource ? ` · data: ${c.dataSource}` : ""}${
          roi.caveat ? ` · ROI CAVEAT: ${roi.caveat}` : ""
        }${c.costNote ? ` · COST CAVEAT: ${c.costNote}` : ""}`
      );
    }

    // --- Portfolio summary ---
    const sum = summarizePortfolio(scored);
    lines.push("");
    lines.push("## Portfolio summary");
    lines.push(
      `- Diversification: ${sum.diversification.label} (${sum.tierCounts.reach} reach / ${sum.tierCounts.target} target / ${sum.tierCounts.safety} safety). ${sum.diversification.message}`
    );
    lines.push(
      `- Averages: yield ${sum.yieldLabel} (${
        sum.avgRoiScore != null ? sum.avgRoiScore.toFixed(1) : "—"
      }/5), admit chance ${formatPercent(sum.avgAdmitChance)}, net cost ${formatUSD(
        sum.avgNetPrice
      )}/yr, sticker ${formatUSD(sum.avgStickerPrice)}/yr`
    );
  }

  // --- Scholarships (ranked by yield) ---
  const scoredSch = SCHOLARSHIPS.map((s) => scoreScholarship(s, profile));
  const topByYield = rankScholarships(scoredSch, "yield", false).slice(0, 14);
  lines.push("");
  lines.push(
    "## Scholarships available in Yieldly, ranked by expected value (win odds × amount)"
  );
  for (const s of topByYield) {
    const { scholarship: sc } = s;
    lines.push(
      `- ${sc.name} (${sc.provider}): ${formatUSD(sc.amount)}, ${ODDS_LABEL[
        sc.competitiveness
      ].toLowerCase()} (~${(s.winProbability * 100).toFixed(2)}%), expected value ≈ ${formatUSD(
        s.expectedValue
      )}, deadline ${sc.deadline}${s.matchesProfile ? " — FITS THEIR MAJOR" : ""}`
    );
  }
  lines.push(
    `(That's the top 14 of ${SCHOLARSHIPS.length} in the curated set; amounts/odds are approximate estimates.)`
  );

  return lines.join("\n");
}
