import type {
  College,
  RiskAssessment,
  RoiAssessment,
  ScoredCollege,
  StudentProfile,
} from "@/lib/types";
import { regionForCollege } from "@/lib/geo";
import { actToSat } from "@/lib/concordance";
import { formatPercent } from "@/lib/utils";

/**
 * Yieldly's risk/return engine (Phase 2).
 *
 * A transparent, rules-based estimate — NOT a machine-learning model and NOT a
 * guarantee, which is the honest-by-design positioning in docs/PRD.md. Every
 * formula here is documented and traceable by hand.
 *
 * Every number a card displays as "real" (net price, earnings, admit rate)
 * traces back to College Scorecard data; the risk tier and 1–5 ROI score are
 * clearly-labeled Yieldly estimates derived from those real numbers. The
 * discovery cards and the portfolio dashboard both consume this one engine, so
 * a school scores identically everywhere it appears.
 */

// --- Risk (the "chancing" logic) -------------------------------------------

/**
 * Baseline annual earnings for a worker whose highest credential is a high-school
 * diploma, age-matched to Scorecard's "10 years after entry" cohort (~age 28):
 * ~$40k for 25–34-year-old full-time HS-only workers (U.S. Census, 2023). Used
 * as the no-college counterfactual when sizing a degree's earnings premium.
 *
 * Known simplification: this U.S. baseline is also applied to international
 * schools' ROI (src/lib/international-colleges.ts) for a single consistent
 * cross-app formula, even though the "no college" counterfactual wage genuinely
 * differs by country. It still measures a real, comparable thing (is the
 * earnings premium worth the cost, in USD) — just calibrated to a U.S. floor,
 * which tends to understate ROI for cheaper countries and overstate it for
 * pricier ones. A per-country baseline is a reasonable Phase 5 refinement.
 */
const HS_GRAD_BASELINE = 40_000;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Estimate admit probability for a student, starting from the school's overall
 * admission rate and nudging it by how the student's stats compare to the
 * school's profile. Two independent signals, averaged when both are present so
 * a test-optional student still gets a personalized read from GPA alone:
 *
 *   • SAT signal — the student's SAT vs. the school's average SAT (real data),
 *     measured in ~100-point steps.
 *   • GPA signal — the student's GPA vs. a benchmark GPA *derived from the
 *     school's selectivity* (Scorecard has no admitted-GPA field, so we infer a
 *     reasonable bar: ~3.9 for the most selective schools down to ~3.1 for the
 *     least). Measured so ~0.3 GPA points ≈ one 100-point SAT step.
 *
 * Every step of positive edge multiplies the base odds up (negative, down); the
 * multiplier is clamped hard so we never imply certainty in either direction.
 * Rules-based and explainable by design — never an ML claim (docs/PRD.md).
 */
function estimateAdmitProbability(
  college: College,
  profile: StudentProfile | null
): {
  probability: number | null;
  personalized: boolean;
  usedSat: boolean;
  usedAct: boolean;
  usedGpa: boolean;
  usedIb: boolean;
  usedRigor: boolean;
  usedEc: boolean;
} {
  const base = college.admissionRate;
  if (base == null)
    return {
      probability: null,
      personalized: false,
      usedSat: false,
      usedAct: false,
      usedGpa: false,
      usedIb: false,
      usedRigor: false,
      usedEc: false,
    };

  const unpersonalized = {
    probability: base,
    personalized: false,
    usedSat: false,
    usedAct: false,
    usedGpa: false,
    usedIb: false,
    usedRigor: false,
    usedEc: false,
  };
  if (profile?.completedOnboarding !== true) return unpersonalized;

  const signals: number[] = [];
  let usedSat = false;
  let usedAct = false;
  let usedGpa = false;
  let usedIb = false;
  let usedRigor = false;
  let usedEc = false;

  // Prefer a directly-reported SAT; fall back to the ACT converted via the
  // official College Board/ACT concordance table (src/lib/concordance.ts) so
  // the two never double-count the same underlying signal.
  const effectiveSat =
    profile.satScore ?? (profile.actScore != null ? actToSat(profile.actScore) : null);
  const satWasConverted = profile.satScore == null && profile.actScore != null;

  if (effectiveSat != null && college.satAverage != null) {
    signals.push((effectiveSat - college.satAverage) / 100);
    usedSat = !satWasConverted;
    usedAct = satWasConverted;
  }
  if (profile.gpa != null) {
    // Benchmark GPA scales with selectivity: stricter at reach schools.
    const benchmarkGpa = clamp(3.9 - base * 0.8, 3.1, 3.9);
    signals.push((profile.gpa - benchmarkGpa) * 3.2);
    usedGpa = true;
  }
  if (profile.ibScore != null) {
    // No school publishes a per-institution "average IB score" the way Scorecard
    // publishes SAT averages, so — same honest approach as the GPA benchmark
    // above — this derives an expected IB score from the school's real admit
    // rate rather than inventing a per-school figure: ~41 at the most selective
    // end down to ~28 at the least, scored in ~3-point steps (roughly comparable
    // rigor to a 100-point SAT step). Rules-based estimate, not a published bar.
    const benchmarkIb = clamp(41 - base * 9, 28, 41);
    signals.push((profile.ibScore - benchmarkIb) / 3);
    usedIb = true;
  }
  // Course-rigor signal, combining weighted-GPA course load and AP results —
  // both feed one "usedRigor" flag since they measure the same underlying
  // thing (how hard a course load the student is taking), just from two
  // angles. Neither is scored against a per-school benchmark, because rigor
  // isn't something a school publishes a "typical applicant" figure for —
  // these are self-contained, bounded heuristics, documented as estimates.
  {
    const rigorSignals: number[] = [];
    // Weighted-minus-unweighted GPA gap as a rigor proxy: weighting scales
    // vary a lot by school (some cap at 5.0, some don't), so there's no
    // single "benchmark weighted GPA" to compare against honestly — the GAP
    // between a student's own weighted and unweighted GPA is scale-agnostic
    // and reflects how much AP/Honors credit-weighting they're earning.
    if (profile.weightedGpa != null && profile.gpa != null) {
      const gap = profile.weightedGpa - profile.gpa;
      rigorSignals.push(clamp(gap * 0.8, 0, 1.2));
    }
    // AP classes: each scored exam contributes (score − 3) × 0.25 — a 5 is
    // worth +0.5, a 3 is neutral, a 1 is −0.5. A class not yet exam-scored
    // still earns a small flat +0.1 rigor credit for the coursework itself.
    // Summed across every AP reported, capped so a very large AP load can't
    // dominate GPA/SAT/IB in the average.
    if (profile.apClasses.length > 0) {
      const apEdge = profile.apClasses.reduce(
        (sum, ap) => sum + (typeof ap.score === "number" ? (ap.score - 3) * 0.25 : 0.1),
        0
      );
      rigorSignals.push(clamp(apEdge, -1.5, 2.5));
    }
    if (rigorSignals.length > 0) {
      signals.push(rigorSignals.reduce((a, b) => a + b, 0));
      usedRigor = true;
    }
  }
  if (profile.extracurriculars.length > 0) {
    // Tier weight per activity (CollegeVine-style 1–4 tiers, src/lib/extracurricular-tiers.ts),
    // with the weight of each additional activity beyond the strongest one
    // discounted 30% per step — so one standout Tier 1 activity counts far
    // more than a long list of Tier 4 ones (matches how admissions readers
    // actually describe weighing extracurriculars: a few real standouts, not
    // a checklist). Capped well below GPA/SAT's influence, since this is a
    // self-reported "guesstimate" the app can't verify, not a hard record.
    const TIER_WEIGHT: Record<number, number> = { 1: 1.2, 2: 0.7, 3: 0.3, 4: 0.1 };
    const sorted = [...profile.extracurriculars].sort((a, b) => a.tier - b.tier);
    const ecEdge = sorted.reduce(
      (sum, ec, i) => sum + TIER_WEIGHT[ec.tier] * Math.pow(0.7, i),
      0
    );
    signals.push(clamp(ecEdge, 0, 2.0));
    usedEc = true;
  }

  if (signals.length === 0) return unpersonalized;

  const edge = signals.reduce((a, b) => a + b, 0) / signals.length;
  const multiplier = clamp(1 + edge * 0.26, 0.35, 2.4);
  const probability = clamp(base * multiplier, 0.02, 0.98);
  return { probability, personalized: true, usedSat, usedAct, usedGpa, usedIb, usedRigor, usedEc };
}

export function assessRisk(
  college: College,
  profile: StudentProfile | null
): RiskAssessment {
  const { probability, personalized, usedSat, usedAct, usedGpa, usedIb, usedRigor, usedEc } =
    estimateAdmitProbability(college, profile);

  // No admission data → treat as an unpersonalized Target with a clear note.
  if (probability == null) {
    return {
      tier: "target",
      admitProbability: null,
      label: "Target · admit rate unavailable",
      personalized: false,
      rationale:
        "No published admission rate for this school, so this is a rough middle-ground estimate.",
    };
  }

  // Bucket into tiers by the student's estimated admit chance. Canonical cutoffs:
  // reach = clearly unlikely (<30%), target = the uncertain middle (30–70%),
  // safety = clearly likely (>70%). 70% is a deliberately honest safety floor —
  // a 65% chance still means ~1-in-3 odds of rejection, so it stays a target.
  const tier =
    probability < 0.3 ? "reach" : probability <= 0.7 ? "target" : "safety";

  const tierWord = tier === "reach" ? "Reach" : tier === "target" ? "Target" : "Safety";
  const label = `${tierWord} · ~${formatPercent(probability)} admit`;

  let rationale: string;
  if (personalized) {
    const statNames = [
      usedGpa && "GPA",
      usedSat && "SAT",
      usedAct && "ACT (converted to its SAT equivalent)",
      usedIb && "IB score",
      usedRigor && "course rigor (weighted GPA / AP results)",
      usedEc && "extracurriculars",
    ].filter(Boolean) as string[];
    const stats =
      statNames.length > 1
        ? `${statNames.slice(0, -1).join(", ")} and ${statNames[statNames.length - 1]}`
        : statNames[0];
    rationale = `Your ${stats} weighed against this school's ${formatPercent(
      college.admissionRate
    )} admit rate${
      usedSat || usedAct ? ` and ~${college.satAverage} average SAT` : ""
    }.`;
  } else {
    rationale = `Based on the school's ${formatPercent(
      college.admissionRate
    )} admit rate. Add your GPA or test score to personalize this.`;
  }

  return { tier, admitProbability: probability, label, personalized, rationale };
}

// --- ROI (the "return" logic) ----------------------------------------------

const ROI_LABELS = ["Weak", "Fair", "Solid", "Strong", "Elite"];

/**
 * The realistic annual cost signal for THIS family: the net price for the
 * student's income bracket when Scorecard reports it, otherwise the average net
 * price. Net (not sticker) is the honest cost basis for ROI (docs/DATA_SOURCES.md).
 */
export function effectiveNetPrice(
  college: College,
  profile: StudentProfile | null
): { value: number | null; incomeAdjusted: boolean } {
  if (profile?.incomeBracket && college.netPriceByIncome) {
    const byIncome = college.netPriceByIncome[profile.incomeBracket];
    if (byIncome != null) return { value: byIncome, incomeAdjusted: true };
  }
  return { value: college.netPrice, incomeAdjusted: false };
}

/**
 * Score the financial return 1–5 from the real cost/earnings/debt numbers.
 *
 * Core idea (payback framing): compare four years of net cost (for this family's
 * income bracket when known) against the earnings premium a grad makes over a
 * high-school-diploma baseline. A shorter payback = a better return. Heavy median
 * debt at graduation nudges the score down. Rules-based and explainable.
 */
export function assessRoi(
  college: College,
  profile: StudentProfile | null = null
): RoiAssessment {
  const { value: netPrice, incomeAdjusted } = effectiveNetPrice(college, profile);
  const { medianEarnings10yr: earnings, medianDebt } = college;

  if (netPrice == null || earnings == null) {
    return {
      score: 3,
      label: "Unrated",
      netPrice,
      incomeAdjusted,
      medianEarnings: earnings,
      medianDebt,
      rationale:
        "Not enough cost or earnings data to rate ROI — showing the raw numbers only.",
      caveat: null,
    };
  }

  const fourYearCost = netPrice * 4;
  const premium = Math.max(earnings - HS_GRAD_BASELINE, 4_000);
  const paybackYears = fourYearCost / premium;

  // Map payback (years of premium earnings to recoup 4-yr cost) to 1–5.
  let score =
    paybackYears < 1.5 ? 5 :
    paybackYears < 2.5 ? 4 :
    paybackYears < 4 ? 3 :
    paybackYears < 6 ? 2 : 1;

  // Heavy debt at graduation shaves a point (floor of 1).
  if (medianDebt != null && medianDebt > 30_000 && score > 1) score -= 1;

  // Match the earnings timeframe language to the actual source — never claim
  // "10 years out" for a school whose earningsNote says otherwise (e.g. the
  // UK's LEO dataset reports ~5-yr earnings, not 10-yr).
  const earningsPhrase = college.earningsNote
    ? `earnings (${college.earningsNote})`
    : "median earnings 10 years out";

  const rationale = `~$${Math.round(
    fourYearCost / 1000
  )}k over four years against ~$${Math.round(
    earnings / 1000
  )}k ${earningsPhrase} (≈${paybackYears.toFixed(1)}-yr payback).`;

  // Every non-null earningsNote in this dataset (UK LEO ~5yr, Australia QILT
  // ~3yr, France's 6mo/30mo surveys) is an earlier-career window than the US
  // "10 years after entry" baseline this formula is calibrated around — flag
  // it plainly so a low score doesn't read as "bad investment" when it's
  // really "measured earlier in the career curve." See HS_GRAD_BASELINE's own
  // comment above for the related (smaller) baseline-country caveat.
  const caveat = college.earningsNote
    ? `This score is based on earlier-career pay (${college.earningsNote}), not the 10-yr-out figure U.S. schools use — it likely runs lower than a same-scale U.S. comparison would.`
    : null;

  return {
    score,
    label: ROI_LABELS[score - 1],
    netPrice,
    incomeAdjusted,
    medianEarnings: earnings,
    medianDebt,
    rationale,
    caveat,
  };
}

// --- Vibe tags (quick fit context on the card) -----------------------------

function sizeLabel(college: College): string {
  return college.sizeTier === "small"
    ? "Small"
    : college.sizeTier === "large"
    ? "Large"
    : "Mid-size";
}

function controlLabel(college: College): string {
  return college.control === "public" ? "Public" : "Private";
}

/** 2–3 short tags for at-a-glance fit context. */
export function vibeTags(college: College, region: string): string[] {
  return [sizeLabel(college), controlLabel(college), region].filter(
    (t) => t && t !== "Other"
  );
}

// --- Compose ---------------------------------------------------------------

export function scoreCollege(
  college: College,
  profile: StudentProfile | null
): ScoredCollege {
  const region = regionForCollege(college);
  return {
    college,
    risk: assessRisk(college, profile),
    roi: assessRoi(college, profile),
    region,
    vibeTags: vibeTags(college, region),
  };
}
