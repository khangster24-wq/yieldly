import type {
  College,
  DeckFilters,
  ScoredCollege,
  StudentProfile,
} from "@/lib/types";
import { getColleges } from "@/lib/colleges";
import { scoreCollege } from "@/lib/scoring";

/**
 * Builds the discovery deck: scores every college, applies the pre-swipe
 * filters, and orders by relevance to the student's profile so the deck feels
 * personalized rather than "the whole dataset in a fixed order"
 * (docs/FEATURES.md §1).
 */

function matchesFilters(scored: ScoredCollege, filters: DeckFilters): boolean {
  const { college } = scored;

  // Cost ceiling: when set, exclude schools over budget (and unknown-price ones).
  if (filters.maxNetPrice != null) {
    if (college.netPrice == null || college.netPrice > filters.maxNetPrice) {
      return false;
    }
  }

  if (filters.regions.length > 0 && !filters.regions.includes(scored.region)) {
    return false;
  }

  if (filters.sizes.length > 0 && !filters.sizes.includes(college.sizeTier)) {
    return false;
  }

  if (filters.controls.length > 0) {
    const isPublic = college.control === "public";
    const wantPublic = filters.controls.includes("public");
    const wantPrivate = filters.controls.includes("private");
    if (isPublic && !wantPublic) return false;
    if (!isPublic && !wantPrivate) return false;
  }

  return true;
}

/**
 * Relevance score for ordering — higher first. Deterministic (no randomness) so
 * server and client render identically. Rewards: region match, within budget,
 * and a healthy "target" fit (roughly even odds is the most actionable).
 */
function relevance(
  scored: ScoredCollege,
  profile: StudentProfile | null
): number {
  let score = 0;
  const { college } = scored;

  if (profile?.regions?.includes(scored.region)) score += 3;

  if (
    profile?.budgetCeiling != null &&
    college.netPrice != null &&
    college.netPrice <= profile.budgetCeiling
  ) {
    score += 2;
  }

  // A balanced list needs targets most; surface them a touch higher.
  if (scored.risk.tier === "target") score += 1.5;
  else if (scored.risk.tier === "safety") score += 0.5;

  // Strong ROI is a tiebreaker nudge.
  score += scored.roi.score * 0.1;

  return score;
}

export function buildDeck(
  profile: StudentProfile | null,
  filters: DeckFilters
): ScoredCollege[] {
  const scored = getColleges().map((c: College) => scoreCollege(c, profile));
  const filtered = scored.filter((s) => matchesFilters(s, filters));

  return filtered
    .map((s) => ({ s, r: relevance(s, profile) }))
    // Stable-ish ordering: relevance desc, then name for determinism.
    .sort((a, b) => b.r - a.r || a.s.college.name.localeCompare(b.s.college.name))
    .map(({ s }) => s);
}
