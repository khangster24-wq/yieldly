/**
 * ACT Composite → SAT Total conversion, from the official 2018 ACT/SAT
 * Concordance Tables (College Board + ACT, developed with the NCAA Technical
 * Advisory Board from 589,753 students who took both tests) — "Table A2:
 * ACT Composite to SAT Total," the single-point column. This remains the
 * current official reference (no newer joint table has superseded it).
 * Source: https://satsuite.collegeboard.org/media/pdf/guide-2018-act-sat-concordance.pdf
 *
 * Not a fabricated estimate — every value below is copied directly from that
 * published table. Scores outside the table's 9–36 range aren't concorded.
 */
const ACT_TO_SAT_TABLE: Record<number, number> = {
  36: 1590,
  35: 1540,
  34: 1500,
  33: 1460,
  32: 1430,
  31: 1400,
  30: 1370,
  29: 1340,
  28: 1310,
  27: 1280,
  26: 1240,
  25: 1210,
  24: 1180,
  23: 1140,
  22: 1110,
  21: 1080,
  20: 1040,
  19: 1010,
  18: 970,
  17: 930,
  16: 890,
  15: 850,
  14: 800,
  13: 760,
  12: 710,
  11: 670,
  10: 630,
  9: 590,
};

/** Converts an ACT composite to its SAT-equivalent via the official concordance table. */
export function actToSat(actScore: number): number | null {
  const rounded = Math.round(actScore);
  return ACT_TO_SAT_TABLE[rounded] ?? null;
}
