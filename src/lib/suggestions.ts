import type { College, RiskTier, ScoredCollege, StudentProfile } from "@/lib/types";
import { scoreCollege } from "@/lib/scoring";
import { getColleges } from "@/lib/colleges";

/**
 * "Suggested for you" — a transparent recommendation pass, not a new model.
 * It only ranks schools with the same real, already-computed risk/ROI scores
 * every other screen shows, weighted by three honest, explainable signals:
 *
 *   1. Real ROI score (from actual cost/earnings data).
 *   2. Whether the school fills a risk tier the student's portfolio is
 *      genuinely short on (reach/target/safety, from the same diversification
 *      logic the dashboard itself uses) — the single biggest weight, since
 *      that's the concept the whole app is built around.
 *   3. A soft bonus for matching the student's stated region preference.
 *
 * No new data, no black box — same inputs and formulas as everywhere else,
 * just re-ranked toward what would most improve THIS student's list.
 */

export interface SuggestedSchool {
  scored: ScoredCollege;
  /** One-line, plain-English reason this school was picked. */
  reason: string;
}

const TIER_BOOST = 3;
const REGION_BOOST = 1.5;

export function suggestSchools(
  savedColleges: College[],
  profile: StudentProfile | null,
  count = 5
): SuggestedSchool[] {
  const savedIds = new Set(savedColleges.map((c) => c.id));
  const candidates = getColleges().filter((c) => !savedIds.has(c.id));
  if (candidates.length === 0) return [];

  const scoredPortfolio = savedColleges.map((c) => scoreCollege(c, profile));
  const tierCounts: Record<RiskTier, number> = { reach: 0, target: 0, safety: 0 };
  for (const s of scoredPortfolio) tierCounts[s.risk.tier]++;

  // Only chase a tier gap once there's enough of a list to call it "uneven" —
  // with 0-2 saved schools there's no real gap to diagnose yet.
  const total = scoredPortfolio.length;
  let priorityTier: RiskTier | null = null;
  if (total >= 3) {
    const entries = (Object.entries(tierCounts) as [RiskTier, number][]).sort(
      (a, b) => a[1] - b[1]
    );
    if (entries[0][1] / total < 1 / 3) priorityTier = entries[0][0];
  }

  const regions = new Set(profile?.regions ?? []);

  const scoredCandidates = candidates.map((c) => scoreCollege(c, profile));

  // Soft budget filter: prefer in-budget picks, but never shrink the pool
  // below what's needed to fill `count` — a hard filter that empties the
  // list is worse than a slightly-over-budget suggestion.
  const inBudget =
    profile?.budgetCeiling != null
      ? scoredCandidates.filter(
          (s) => s.roi.netPrice != null && s.roi.netPrice <= profile.budgetCeiling! * 1.15
        )
      : scoredCandidates;
  const pool = inBudget.length >= count ? inBudget : scoredCandidates;

  const ranked = pool
    .map((scored) => {
      let rank = 0;
      if (scored.roi.label !== "Unrated") rank += scored.roi.score;
      if (scored.risk.admitProbability != null) rank += scored.risk.admitProbability * 0.5;
      if (priorityTier && scored.risk.tier === priorityTier) rank += TIER_BOOST;
      if (regions.size > 0 && regions.has(scored.region)) rank += REGION_BOOST;
      return { scored, rank };
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, count);

  return ranked.map(({ scored }) => ({
    scored,
    reason: buildReason(scored, priorityTier, regions),
  }));
}

function buildReason(
  scored: ScoredCollege,
  priorityTier: RiskTier | null,
  regions: Set<string>
): string {
  if (priorityTier && scored.risk.tier === priorityTier) {
    return `You're short on ${priorityTier} schools — this fills that gap.`;
  }
  if (regions.size > 0 && regions.has(scored.region)) {
    return `Matches your ${scored.region} preference.`;
  }
  if (scored.roi.label === "Elite" || scored.roi.label === "Strong") {
    return `Real ${scored.roi.label.toLowerCase()} ROI for the cost.`;
  }
  return `A solid ${scored.risk.tier} option worth a look.`;
}
