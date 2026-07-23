import type { RiskTier, ScoredCollege } from "@/lib/types";

/**
 * Portfolio aggregation — turns the list of saved, scored schools into the
 * summary the dashboard renders. The whole framing mirrors an investment
 * portfolio (docs/PRD.md): tier allocation = diversification, average ROI =
 * yield, admit chance = risk. All derived from the transparent scoring engine.
 */

export type DiversificationStatus =
  | "empty"
  | "sparse"
  | "reach-heavy"
  | "safety-heavy"
  | "balanced"
  | "uneven";

export type Tone = "good" | "warn" | "neutral";

export interface TierBuckets {
  reach: ScoredCollege[];
  target: ScoredCollege[];
  safety: ScoredCollege[];
}

export interface PortfolioSummary {
  count: number;
  buckets: TierBuckets;
  tierCounts: Record<RiskTier, number>;
  diversification: {
    status: DiversificationStatus;
    label: string;
    /** One-liner in brand voice, with the investing analogy (the concept payoff). */
    message: string;
    tone: Tone;
  };
  avgNetPrice: number | null;
  avgStickerPrice: number | null;
  /** Mean ROI score 1–5 across the portfolio — the "yield" of the list. */
  avgRoiScore: number | null;
  yieldLabel: string;
  /** Mean estimated admit chance 0–1 across schools that have one. */
  avgAdmitChance: number | null;
}

const YIELD_LABELS = ["Weak", "Fair", "Solid", "Strong", "Elite"];

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function bucketByTier(portfolio: ScoredCollege[]): TierBuckets {
  const buckets: TierBuckets = { reach: [], target: [], safety: [] };
  for (const s of portfolio) buckets[s.risk.tier].push(s);
  return buckets;
}

/**
 * Diversification verdict. Balanced = a spread across all three risk levels with
 * no single tier dominating; skewed = one tier is at least half the list.
 */
function assessDiversification(
  buckets: TierBuckets,
  total: number
): PortfolioSummary["diversification"] {
  const r = buckets.reach.length;
  const t = buckets.target.length;
  const s = buckets.safety.length;

  if (total === 0) {
    return { status: "empty", label: "Empty", message: "", tone: "neutral" };
  }
  if (total < 3) {
    return {
      status: "sparse",
      label: "Getting started",
      message:
        "Add a few more schools and Yieldly will show how diversified your list is.",
      tone: "neutral",
    };
  }

  if (r / total >= 0.5) {
    return {
      status: "reach-heavy",
      label: "Reach-heavy",
      message:
        "Exciting, but risky — like betting the whole portfolio on moonshots. Add a couple of targets or safeties to lock in options.",
      tone: "warn",
    };
  }
  if (s / total >= 0.5) {
    return {
      status: "safety-heavy",
      label: "Safety-heavy",
      message:
        "Low risk, but you may be underinvesting in upside. A reach or two adds ambition without much downside.",
      tone: "warn",
    };
  }

  const missing = [
    r === 0 && "reach",
    t === 0 && "target",
    s === 0 && "safety",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return {
      status: "uneven",
      label: "Uneven",
      message: `You have no ${missing.join(" or ")} schools yet — spreading across all three risk levels diversifies your list.`,
      tone: "neutral",
    };
  }

  return {
    status: "balanced",
    label: "Balanced",
    message:
      "A healthy spread across risk levels — the college version of a diversified portfolio. Nicely done.",
    tone: "good",
  };
}

export function summarizePortfolio(portfolio: ScoredCollege[]): PortfolioSummary {
  const buckets = bucketByTier(portfolio);
  const count = portfolio.length;

  const avgNetPrice = mean(
    portfolio.map((s) => s.roi.netPrice).filter((n): n is number => n != null)
  );
  const avgStickerPrice = mean(
    portfolio
      .map((s) => s.college.costOfAttendance)
      .filter((n): n is number => n != null)
  );
  // Only average schools we could actually rate — an "Unrated" ROI (missing
  // cost/earnings data) shouldn't masquerade as a neutral 3 in the yield.
  const avgRoiScore = mean(
    portfolio
      .filter((s) => s.roi.label !== "Unrated")
      .map((s) => s.roi.score)
  );
  const avgAdmitChance = mean(
    portfolio
      .map((s) => s.risk.admitProbability)
      .filter((n): n is number => n != null)
  );

  const yieldLabel =
    avgRoiScore == null
      ? "—"
      : YIELD_LABELS[Math.min(4, Math.max(0, Math.round(avgRoiScore) - 1))];

  return {
    count,
    buckets,
    tierCounts: {
      reach: buckets.reach.length,
      target: buckets.target.length,
      safety: buckets.safety.length,
    },
    diversification: assessDiversification(buckets, count),
    avgNetPrice,
    avgStickerPrice,
    avgRoiScore,
    yieldLabel,
    avgAdmitChance,
  };
}
