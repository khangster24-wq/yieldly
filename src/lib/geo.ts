import type { College } from "@/lib/types";

/**
 * Maps a U.S. state to one of Yieldly's onboarding regions, so a school's
 * location can be filtered and tagged consistently with what the student picked.
 * Region names must match the REGIONS list in src/lib/regions.ts.
 */
const STATE_TO_REGION: Record<string, string> = {
  // Northeast
  ME: "Northeast", NH: "Northeast", VT: "Northeast", MA: "Northeast",
  RI: "Northeast", CT: "Northeast",
  // Mid-Atlantic
  NY: "Mid-Atlantic", NJ: "Mid-Atlantic", PA: "Mid-Atlantic",
  DE: "Mid-Atlantic", MD: "Mid-Atlantic", DC: "Mid-Atlantic", VA: "Mid-Atlantic",
  WV: "Mid-Atlantic",
  // Southeast
  NC: "Southeast", SC: "Southeast", GA: "Southeast", FL: "Southeast",
  TN: "Southeast", KY: "Southeast", AL: "Southeast", MS: "Southeast",
  AR: "Southeast", LA: "Southeast",
  // Midwest
  OH: "Midwest", MI: "Midwest", IN: "Midwest", IL: "Midwest", WI: "Midwest",
  MN: "Midwest", IA: "Midwest", MO: "Midwest", ND: "Midwest", SD: "Midwest",
  NE: "Midwest", KS: "Midwest",
  // Southwest
  TX: "Southwest", OK: "Southwest", NM: "Southwest", AZ: "Southwest",
  // Mountain West
  CO: "Mountain West", UT: "Mountain West", NV: "Mountain West",
  ID: "Mountain West", MT: "Mountain West", WY: "Mountain West",
  // West Coast
  CA: "West Coast", OR: "West Coast", WA: "West Coast",
  AK: "West Coast", HI: "West Coast",
};

export function regionForState(state: string): string {
  return STATE_TO_REGION[state.toUpperCase()] ?? "Other";
}

/**
 * Buckets an international country into one of Yieldly's international region
 * groups (the geography IB-diploma students most often target). Kept coarse and
 * few so the filter list stays usable — see src/lib/regions.ts.
 */
const COUNTRY_TO_REGION: Record<string, string> = {
  "United Kingdom": "United Kingdom",
  "China": "East Asia",
  "Hong Kong": "East Asia",
  "South Korea": "East Asia",
  "Australia": "Australia & NZ",
  "Italy": "Continental Europe",
  "Spain": "Continental Europe",
  "France": "Continental Europe",
};

/**
 * Region for any college, domestic or international — the single entry point
 * scoring/filtering should use instead of calling regionForState directly.
 */
export function regionForCollege(college: Pick<College, "state" | "country">): string {
  if (college.country) return COUNTRY_TO_REGION[college.country] ?? college.country;
  return regionForState(college.state);
}
