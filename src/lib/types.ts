/** Shared domain types for Yieldly. */

export type Control = "public" | "private-nonprofit" | "private-forprofit";
export type SizeTier = "small" | "medium" | "large";
export type RiskTier = "reach" | "target" | "safety";

/**
 * A single institution, normalized from the College Scorecard API
 * (see scripts/fetch-colleges.ts and docs/DATA_SOURCES.md). Every field here is
 * real government data — derived Yieldly scores (risk/ROI) are computed
 * separately in Phase 2 and clearly labeled as estimates.
 */
export interface College {
  id: number; // Scorecard institution id (`id`)
  name: string; // `school.name`
  city: string; // `school.city`
  state: string; // `school.state`
  control: Control; // derived from `school.ownership`
  sizeTier: SizeTier; // derived from `latest.student.size`
  size: number | null; // `latest.student.size`
  /** Admission rate 0–1 — feeds the risk score. Null when not reported. */
  admissionRate: number | null; // `latest.admissions.admission_rate.overall`
  /**
   * Total cost of attendance for one academic year — the sticker price BEFORE
   * financial aid, already inclusive of tuition, fees, and room & board
   * (`latest.cost.attendance.academic_year`). This is the headline cost on the
   * card. Null when not reported.
   */
  costOfAttendance: number | null;
  /**
   * Average net price — what the average aided family actually pays AFTER
   * grants/scholarships, also inclusive of room & board (public: `.public`,
   * private: `.private`). Shown as the "after aid" figure and used as the true
   * cost basis for the ROI estimate.
   */
  netPrice: number | null;
  /** Net price by income bracket ($ ranges from Scorecard), when available. */
  netPriceByIncome?: Partial<Record<IncomeBracket, number>>;
  /** Out-of-state (or private) tuition alone, for detail. */
  tuition: number | null; // `latest.cost.tuition.out_of_state`
  /** On-campus room & board, for detail. */
  roomBoard: number | null; // `latest.cost.roomboard.oncampus`
  /** Median earnings 10 years after entry — feeds ROI. */
  medianEarnings10yr: number | null; // `latest.earnings.10_yrs_after_entry.median`
  /** Median cumulative debt at graduation — feeds ROI. */
  medianDebt: number | null; // `latest.aid.median_debt.completers.overall`
  /** SAT/ACT context for stat-relative risk personalization (Phase 2). */
  satAverage: number | null; // `latest.admissions.sat_scores.average.overall`
  /**
   * Top 3 fields of study by real share of bachelor's degrees awarded
   * (`latest.academics.program_percentage.*`), human-readable labels only —
   * e.g. ["Business & Marketing", "Engineering", "Computer Science"].
   * US schools only (see scripts/fetch-majors.ts); undefined for
   * international schools (no equivalent public per-institution dataset).
   */
  topMajors?: string[];
  /**
   * Optional campus photo for the card banner. When absent (the default today),
   * the card falls back to the designed gradient monogram. Wired now so real
   * photos can drop in during the Phase 5 polish pass without rework.
   */
  imageUrl?: string | null;

  // --- International schools (undefined/absent below = a U.S. institution) ---
  /**
   * Country name, set only for non-U.S. institutions (e.g. "United Kingdom",
   * "South Korea"). Drives region bucketing (src/lib/geo.ts) and the honesty
   * disclosures below — its presence is what marks a school as international.
   */
  country?: string;
  /**
   * Overrides the default "median, 10 yrs out" earnings caption when the
   * source uses a different post-grad window (e.g. the UK's LEO dataset reports
   * 5-year earnings, not 10-year) — never silently mislabel a timeframe.
   */
  earningsNote?: string;
  /**
   * Short attribution shown on international cards in place of the implied
   * "College Scorecard" provenance — e.g. "Uni-published fees + aggregated
   * public reporting" for schools without a single official database like
   * Scorecard (UK/Australia) or LEO/QILT (UK/Australia government data).
   */
  dataSource?: string;
  /**
   * Extra cost caveat shown alongside `dataSource` when the cost figure needs
   * more context than provenance alone — e.g. a school that's primarily a
   * graduate institution and only offers one narrow undergraduate track, so
   * its "tuition" isn't representative of the school as a whole.
   */
  costNote?: string;
}

/** Income brackets matching College Scorecard's net-price-by-income fields. */
export type IncomeBracket =
  | "0-30000"
  | "30001-48000"
  | "48001-75000"
  | "75001-110000"
  | "110001-plus";

/** One AP class the student has taken (or is taking) and its exam score. */
export interface ApClassEntry {
  /** Official College Board course title, e.g. "AP Calculus BC". */
  subject: string;
  /** 1–5, or "pending" if the exam hasn't been taken/scored yet. */
  score: 1 | 2 | 3 | 4 | 5 | "pending";
}

/** CollegeVine-style 1 (rarest/strongest) – 4 (most common) extracurricular tier. */
export type ExtracurricularTier = 1 | 2 | 3 | 4;

/** One extracurricular activity the student self-reports. */
export interface ExtracurricularEntry {
  /** Broad category, e.g. "Leadership Role", "Sports", "Internship". */
  category: string;
  /** Free-text specifics, e.g. "Captain, Varsity Soccer" — optional detail. */
  detail: string;
  tier: ExtracurricularTier;
}

/** Student profile collected during onboarding; used across all four features. */
export interface StudentProfile {
  gpa: number | null; // unweighted 0–4.0
  /** Weighted GPA, same scale as the student's school reports (often 0–5.0). */
  weightedGpa: number | null;
  satScore: number | null; // 400–1600, or null if not provided
  /** ACT composite, 1–36 — converted to an SAT-equivalent via the official concordance for scoring. */
  actScore: number | null;
  /** IB Diploma total score, 0–45 (predicted or final) — or null if not on the IB track. */
  ibScore: number | null;
  /** AP classes taken — skip if on the IB track (see onboarding disclaimer); doesn't affect chancing either way if empty. */
  apClasses: ApClassEntry[];
  extracurriculars: ExtracurricularEntry[];
  /** Rough annual budget ceiling (net price the family can absorb). */
  budgetCeiling: number | null;
  incomeBracket: IncomeBracket | null;
  /** Preferred U.S. regions for discovery filtering. */
  regions: string[];
  majorInterest: string | null;
  /** Distinguishes "not answered yet" from "chose to skip stats". */
  completedOnboarding: boolean;
}

export const EMPTY_PROFILE: StudentProfile = {
  gpa: null,
  weightedGpa: null,
  satScore: null,
  actScore: null,
  ibScore: null,
  apClasses: [],
  extracurriculars: [],
  budgetCeiling: null,
  incomeBracket: null,
  regions: [],
  majorInterest: null,
  completedOnboarding: false,
};

/**
 * Risk assessment for one school (the "chancing" logic). Shape is the contract
 * Phase 2's real scoring engine plugs into — Phase 1 fills it with a transparent,
 * admission-rate-based estimate (see src/lib/scoring.ts). Always an estimate,
 * never a guarantee.
 */
export interface RiskAssessment {
  tier: RiskTier;
  /** Estimated admit probability 0–1 for this student (or the raw rate if unpersonalized). */
  admitProbability: number | null;
  /** Short label, e.g. "Reach · ~15% admit". */
  label: string;
  /** True when the student's own stats sharpened the estimate. */
  personalized: boolean;
  /** One-line plain-English "why", for the explainable-not-black-box promise. */
  rationale: string;
}

/** ROI assessment for one school (the "return" logic). 1–5 with the raw inputs exposed. */
export interface RoiAssessment {
  /** 1 (weak) – 5 (elite). */
  score: number;
  label: string;
  /** The net price the score is based on — income-bracket-specific when possible. */
  netPrice: number | null;
  /** True when `netPrice` is the student's income-bracket figure (vs. the average). */
  incomeAdjusted: boolean;
  medianEarnings: number | null;
  medianDebt: number | null;
  rationale: string;
  /**
   * Set when the earnings figure behind this score comes from an
   * earlier-career window than the US 10-year baseline (e.g. the UK's ~5-yr
   * LEO data, Australia's ~3-yr QILT data) — the score likely runs lower than
   * a same-scale US comparison would, since earlier-career pay is naturally
   * lower than settled-career pay. Null when the earnings figure is already
   * on the 10-year US basis (or the score is Unrated).
   */
  caveat: string | null;
}

/** A college enriched with Yieldly's derived (estimated) scores + display tags. */
export interface ScoredCollege {
  college: College;
  risk: RiskAssessment;
  roi: RoiAssessment;
  region: string;
  vibeTags: string[];
}

export type ControlFilter = "public" | "private";

/** Pre-swipe deck filters (docs/FEATURES.md §1). */
export interface DeckFilters {
  /** Max annual net price, or null for no ceiling. */
  maxNetPrice: number | null;
  regions: string[];
  sizes: SizeTier[];
  controls: ControlFilter[];
}

export const EMPTY_FILTERS: DeckFilters = {
  maxNetPrice: null,
  regions: [],
  sizes: [],
  controls: [],
};
