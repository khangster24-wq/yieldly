import type { College } from "@/lib/types";
import dataset from "@/data/colleges.json";
import { SEED_COLLEGES } from "@/lib/seed-colleges";
import { INTERNATIONAL_COLLEGES } from "@/lib/international-colleges";

/**
 * Cached College Scorecard dataset (real data, refreshed at build time via
 * scripts/fetch-colleges.ts). Until an API key is provided and the fetch script
 * runs, that cache is empty and we fall back to the curated real-school seed set
 * (src/lib/seed-colleges.ts) so the app is demoable end to end. `isLiveData()`
 * distinguishes the two so the UI can be honest about which is showing.
 *
 * International schools (src/lib/international-colleges.ts) aren't part of the
 * Scorecard pipeline at all — Scorecard only covers U.S. institutions — so they're
 * appended unconditionally, regardless of whether the U.S. pull has run.
 */
interface CollegeDataset {
  generatedAt: string | null;
  source: string;
  note: string;
  colleges: College[];
}

const data = dataset as unknown as CollegeDataset;

/** True once the live College Scorecard pull has populated the cache. */
export function isLiveData(): boolean {
  return data.colleges.length > 0;
}

/** All colleges — live U.S. cache (or the seed fallback) plus international schools. */
export function getColleges(): College[] {
  const us = isLiveData() ? data.colleges : SEED_COLLEGES;
  return [...us, ...INTERNATIONAL_COLLEGES];
}

export function getDatasetMeta() {
  const live = isLiveData();
  return {
    live,
    generatedAt: data.generatedAt,
    source: live ? data.source : "Curated seed set of real institutions",
    count: getColleges().length,
    internationalCount: INTERNATIONAL_COLLEGES.length,
  };
}
