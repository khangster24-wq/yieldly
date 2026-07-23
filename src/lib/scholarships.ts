import type { StudentProfile } from "@/lib/types";

/**
 * Scholarship Yield Finder engine (Phase 3).
 *
 * The core idea mirrors the rest of Yieldly: treat a scholarship like an
 * investment and rank by EXPECTED VALUE, not by sticker amount.
 *
 *     expected_value = estimated_win_probability × award_amount
 *
 * A $50k no-essay sweepstakes with lottery odds has a worse expected value than
 * a $2,500 field-specific award you're actually likely to win. Surfacing that is
 * the whole point — "high amount, low competition = strong yield."
 *
 * Win probability is a transparent, rules-based estimate from each scholarship's
 * competitiveness tier (documented below), NOT a real per-applicant statistic.
 */

export type Competitiveness =
  | "broad" // minimal criteria / many awards → best odds
  | "moderate" // selective national or field pool
  | "competitive" // highly selective national
  | "elite" // premier national, thousands of applicants per award
  | "lottery"; // mass-entry sweepstakes / no-essay, one winner

/** Broad academic field a scholarship targets (for profile matching). */
export type ScholarshipField = "any" | "stem" | "business" | "healthcare";

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  /** Notable/maximum award amount in USD. */
  amount: number;
  renewable: boolean;
  /** Human-readable deadline, e.g. "Oct 31", "Rolling", "Monthly". */
  deadline: string;
  /** Month 1–12 for sorting; null for rolling/monthly/varies. */
  deadlineMonth: number | null;
  competitiveness: Competitiveness;
  field: ScholarshipField;
  /** Short display tags, e.g. ["All majors", "HS senior", "Need-based"]. */
  eligibility: string[];
  blurb: string;
  /** Official provider page to learn about / apply for this scholarship. */
  url: string;
}

/**
 * Estimated win probability by competitiveness tier. Deliberately rough and
 * documented — these are order-of-magnitude odds, not published rates:
 *   broad       ~8%    minimal criteria or hundreds of awards
 *   moderate    ~3%    field/regional pools, selective but attainable
 *   competitive ~0.8%  highly selective national programs
 *   elite       ~0.2%  premier national awards, thousands per slot
 *   lottery     ~0.03% no-essay sweepstakes with a single winner
 */
export const WIN_PROBABILITY: Record<Competitiveness, number> = {
  broad: 0.08,
  moderate: 0.03,
  competitive: 0.008,
  elite: 0.002,
  lottery: 0.0003,
};

/** Human label for the odds tier (shown on the card). */
export const ODDS_LABEL: Record<Competitiveness, string> = {
  broad: "High odds",
  moderate: "Moderate odds",
  competitive: "Low odds",
  elite: "Very low odds",
  lottery: "Lottery odds",
};

export type YieldTier = "strong" | "solid" | "fair" | "longshot";

export interface ScoredScholarship {
  scholarship: Scholarship;
  winProbability: number;
  expectedValue: number;
  yieldTier: YieldTier;
  yieldLabel: string;
  /** True when the scholarship's field fits the student's major interest. */
  matchesProfile: boolean;
  /** One-line, plain-English "why this yield" (explainable, like the risk score). */
  rationale: string;
}

const YIELD_LABEL: Record<YieldTier, string> = {
  strong: "Strong yield",
  solid: "Solid yield",
  fair: "Fair yield",
  longshot: "Long shot",
};

/** Map expected value ($) to a yield tier. Thresholds documented for transparency. */
function yieldTierFor(expectedValue: number): YieldTier {
  if (expectedValue >= 250) return "strong";
  if (expectedValue >= 100) return "solid";
  if (expectedValue >= 30) return "fair";
  return "longshot";
}

/** The academic fields that count as a match for a given student major. */
function fieldsForMajor(major: string | null): ScholarshipField[] | "all" {
  switch (major) {
    case "Business / Finance":
    case "Economics":
      return ["business"];
    case "Computer Science":
    case "Engineering":
      return ["stem"];
    case "Biology / Pre-Med":
      return ["stem", "healthcare"];
    default:
      return "all"; // Undecided / unknown → everything is a fit
  }
}

/**
 * True only for a FIELD-SPECIFIC fit — a scholarship targeted to the student's
 * major (e.g. a business award for a business student). General "any-major"
 * scholarships are available to everyone, so they aren't a personalized signal
 * and don't earn the "fits your major" badge.
 */
function scholarshipMatches(
  scholarship: Scholarship,
  profile: StudentProfile | null
): boolean {
  if (scholarship.field === "any") return false;
  const fields = fieldsForMajor(profile?.majorInterest ?? null);
  if (fields === "all") return false; // undecided → no specific field to match
  return fields.includes(scholarship.field);
}

export function scoreScholarship(
  scholarship: Scholarship,
  profile: StudentProfile | null
): ScoredScholarship {
  const winProbability = WIN_PROBABILITY[scholarship.competitiveness];
  const expectedValue = winProbability * scholarship.amount;
  const yieldTier = yieldTierFor(expectedValue);
  const matchesProfile = scholarshipMatches(scholarship, profile);

  const rationale = `${ODDS_LABEL[
    scholarship.competitiveness
  ].toLowerCase()} on a $${scholarship.amount.toLocaleString()} award → about $${Math.round(
    expectedValue
  ).toLocaleString()} of expected value.`;

  return {
    scholarship,
    winProbability,
    expectedValue,
    yieldTier,
    yieldLabel: YIELD_LABEL[yieldTier],
    matchesProfile,
    rationale,
  };
}

export type ScholarshipSort = "yield" | "amount" | "deadline";

/**
 * Rank scholarships by the chosen metric. Default is expected value (the "yield"
 * thesis) — kept honest and undistorted; personalization is offered through the
 * optional "fits my major" filter rather than by reordering the yield list
 * (docs/FEATURES.md §3).
 */
export function rankScholarships(
  scored: ScoredScholarship[],
  sort: ScholarshipSort,
  matchesOnly: boolean
): ScoredScholarship[] {
  const pool = matchesOnly ? scored.filter((s) => s.matchesProfile) : scored;

  return [...pool].sort((a, b) => {
    if (sort === "amount") return b.scholarship.amount - a.scholarship.amount;
    if (sort === "deadline") {
      // Soonest real deadline first; rolling/monthly (null) sink to the bottom.
      return (a.scholarship.deadlineMonth ?? 99) - (b.scholarship.deadlineMonth ?? 99);
    }
    return b.expectedValue - a.expectedValue; // "yield"
  });
}
