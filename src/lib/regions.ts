/** The canonical Yieldly region list — shared by onboarding and the deck filters. */
export const REGIONS = [
  "Northeast",
  "Mid-Atlantic",
  "Southeast",
  "Midwest",
  "Southwest",
  "West Coast",
  "Mountain West",
  // International — the geography IB-diploma students most often target
  // (see src/lib/geo.ts → regionForCollege for the country → region mapping).
  "United Kingdom",
  "Continental Europe",
  "East Asia",
  "Australia & NZ",
] as const;
