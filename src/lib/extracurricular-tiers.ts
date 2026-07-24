/**
 * Extracurricular categories and tier framework for the profile editor.
 *
 * The 4-tier structure is adapted from CollegeVine's published methodology
 * (blog.collegevine.com/breaking-down-the-4-tiers-of-extracurricular-activities) —
 * the same real-world framework referenced when this project researched how
 * other chancing platforms work (see docs/ROADMAP.md). Tier 1 = rarest/highest
 * distinction, Tier 4 = most common. Descriptions are paraphrased, not quoted,
 * and adapted with concrete examples matching this app's category list.
 */

export const EXTRACURRICULAR_CATEGORIES: string[] = [
  "Leadership Role",
  "Sports",
  "Internship",
  "Competition",
  "Research",
  "Arts / Performance",
  "Business / Entrepreneurship",
  "Volunteering / Community Service",
  "Work Experience",
  "Other Club or Organization",
];

export const TIER_DESCRIPTIONS: Record<
  1 | 2 | 3 | 4,
  { label: string; description: string; examples: string }
> = {
  1: {
    label: "Tier 1 — Exceptional, rare distinction",
    description:
      "National or international-level recognition, or founding something with real outside reach.",
    examples:
      "e.g. national competition winner/finalist, nationally-recruited athlete, founded an org with regional/national press coverage, published research",
  },
  2: {
    label: "Tier 2 — Strong achievement or leadership",
    description:
      "Real leadership or a standout result, usually at a regional or state level.",
    examples:
      "e.g. club president, team captain, all-state athlete/musician, regional competition winner",
  },
  3: {
    label: "Tier 3 — Solid, sustained involvement",
    description:
      "Genuine commitment or a minor leadership role, without a distinction that stands out beyond your school.",
    examples:
      "e.g. treasurer/secretary of a club, consistent varsity roster spot, self-started project with modest reach",
  },
  4: {
    label: "Tier 4 — General participation",
    description: "The most common kind of involvement colleges see — real, but not distinguishing on its own.",
    examples:
      "e.g. general club member, JV sports, regular volunteering, casual online business/side project",
  },
};
