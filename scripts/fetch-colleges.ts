/**
 * Yieldly — College Scorecard data pull & cache.
 *
 * Pulls a curated, diverse subset (~250) of real U.S. institutions from the
 * U.S. Department of Education's College Scorecard API and caches them to
 * src/data/colleges.json for fast, offline-friendly use at runtime
 * (see docs/DATA_SOURCES.md).
 *
 * This script is STUBBED ON THE API KEY: with no SCORECARD_API_KEY set it prints
 * setup instructions and exits 0 without touching the cache — so scaffolding and
 * `npm run build` never depend on the network or a secret. Provide a free key
 * from https://api.data.gov/signup and re-run `npm run data:colleges`.
 *
 * Strategy (documented so the curation is explainable, not a black box):
 *   1. Fetch bachelor's-granting institutions, largest first (these are the
 *      well-known, brand-recognizable schools students actually consider).
 *   2. Keep only rows with the fields Yieldly's risk/ROI math needs.
 *   3. Stratified-sample across admission-rate buckets so the final set spans
 *      reaches, targets, and safeties — not just one selectivity tier.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";

import type { College, Control, SizeTier } from "../src/lib/types";

loadEnv({ path: ".env.local" });
loadEnv(); // fall back to .env

const API_KEY = process.env.SCORECARD_API_KEY;
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const OUT_PATH = path.resolve(process.cwd(), "src/data/colleges.json");

/** Target size of the cached dataset (docs say ~150–300). */
const TARGET_COUNT = 250;
/** How many top-by-size rows to pull before stratified sampling. */
const CANDIDATE_POOL = 600;
const PER_PAGE = 100;

/** Scorecard fields we request, mapped to our normalized College type. */
const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.ownership",
  "latest.student.size",
  "latest.admissions.admission_rate.overall",
  "latest.admissions.sat_scores.average.overall",
  "latest.cost.attendance.academic_year", // sticker COA (before aid, incl. room & board)
  "latest.cost.tuition.out_of_state",
  "latest.cost.roomboard.oncampus",
  "latest.cost.avg_net_price.public",
  "latest.cost.avg_net_price.private",
  "latest.cost.net_price.public.by_income_level.0-30000",
  "latest.cost.net_price.public.by_income_level.30001-48000",
  "latest.cost.net_price.public.by_income_level.48001-75000",
  "latest.cost.net_price.public.by_income_level.75001-110000",
  "latest.cost.net_price.public.by_income_level.110001-plus",
  "latest.cost.net_price.private.by_income_level.0-30000",
  "latest.cost.net_price.private.by_income_level.30001-48000",
  "latest.cost.net_price.private.by_income_level.48001-75000",
  "latest.cost.net_price.private.by_income_level.75001-110000",
  "latest.cost.net_price.private.by_income_level.110001-plus",
  "latest.earnings.10_yrs_after_entry.median",
  "latest.aid.median_debt.completers.overall",
].join(",");

/* eslint-disable @typescript-eslint/no-explicit-any */
type ScorecardRow = Record<string, any>;

function ownershipToControl(ownership: number | null): Control {
  // Scorecard: 1 = public, 2 = private nonprofit, 3 = private for-profit.
  if (ownership === 1) return "public";
  if (ownership === 3) return "private-forprofit";
  return "private-nonprofit";
}

function sizeToTier(size: number | null): SizeTier {
  if (size == null) return "medium";
  if (size < 5000) return "small";
  if (size < 15000) return "medium";
  return "large";
}

/** Normalize one Scorecard row into our domain College, picking public/private cost. */
function normalize(row: ScorecardRow): College | null {
  const id = row["id"];
  const name = row["school.name"];
  if (!id || !name) return null;

  const ownership = row["school.ownership"] ?? null;
  const isPublic = ownership === 1;
  const costPrefix = isPublic
    ? "latest.cost.net_price.public.by_income_level"
    : "latest.cost.net_price.private.by_income_level";

  const netPrice = isPublic
    ? row["latest.cost.avg_net_price.public"]
    : row["latest.cost.avg_net_price.private"];

  const byIncome = {
    "0-30000": row[`${costPrefix}.0-30000`] ?? undefined,
    "30001-48000": row[`${costPrefix}.30001-48000`] ?? undefined,
    "48001-75000": row[`${costPrefix}.48001-75000`] ?? undefined,
    "75001-110000": row[`${costPrefix}.75001-110000`] ?? undefined,
    "110001-plus": row[`${costPrefix}.110001-plus`] ?? undefined,
  };

  return {
    id,
    name,
    city: row["school.city"] ?? "",
    state: row["school.state"] ?? "",
    control: ownershipToControl(ownership),
    size: row["latest.student.size"] ?? null,
    sizeTier: sizeToTier(row["latest.student.size"] ?? null),
    admissionRate: row["latest.admissions.admission_rate.overall"] ?? null,
    costOfAttendance: row["latest.cost.attendance.academic_year"] ?? null,
    netPrice: netPrice ?? null,
    netPriceByIncome: byIncome,
    tuition: row["latest.cost.tuition.out_of_state"] ?? null,
    roomBoard: row["latest.cost.roomboard.oncampus"] ?? null,
    medianEarnings10yr: row["latest.earnings.10_yrs_after_entry.median"] ?? null,
    medianDebt: row["latest.aid.median_debt.completers.overall"] ?? null,
    satAverage: row["latest.admissions.sat_scores.average.overall"] ?? null,
  };
}

async function fetchPage(page: number): Promise<ScorecardRow[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", API_KEY!);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));
  // Bachelor's-degree-predominant, currently operating, sorted largest first.
  url.searchParams.set("school.degrees_awarded.predominant", "3");
  url.searchParams.set("school.operating", "1");
  url.searchParams.set("sort", "latest.student.size:desc");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Scorecard API ${res.status} ${res.statusText}: ${await res.text()}`
    );
  }
  const json = (await res.json()) as { results: ScorecardRow[] };
  return json.results ?? [];
}

/**
 * Stratified sample across admission-rate buckets so the cache spans the full
 * selectivity spectrum (reach → safety), not just the biggest schools.
 */
function stratifiedSample(colleges: College[], target: number): College[] {
  const buckets: Record<string, College[]> = {
    reach: [], // admit < 25%
    target: [], // 25–60%
    safety: [], // > 60%
    unknown: [], // no admission rate reported
  };
  for (const c of colleges) {
    if (c.admissionRate == null) buckets.unknown.push(c);
    else if (c.admissionRate < 0.25) buckets.reach.push(c);
    else if (c.admissionRate <= 0.6) buckets.target.push(c);
    else buckets.safety.push(c);
  }

  // Weight toward schools with admission data, but keep a few "unknowns" too.
  const plan: Array<[keyof typeof buckets, number]> = [
    ["reach", Math.round(target * 0.28)],
    ["target", Math.round(target * 0.34)],
    ["safety", Math.round(target * 0.28)],
    ["unknown", Math.round(target * 0.1)],
  ];

  const out: College[] = [];
  for (const [key, n] of plan) {
    out.push(...buckets[key].slice(0, n));
  }
  return out.slice(0, target);
}

async function main() {
  if (!API_KEY) {
    console.log(
      [
        "",
        "⏸  Skipping College Scorecard pull — no SCORECARD_API_KEY found.",
        "",
        "   This is expected during scaffolding. To load real data:",
        "     1. Get a free key: https://api.data.gov/signup",
        "     2. Add to .env.local:  SCORECARD_API_KEY=your_key_here",
        "     3. Re-run:            npm run data:colleges",
        "",
        "   The app runs fine without it — Discover shows a designed",
        "   'connect data' state until the cache is populated.",
        "",
      ].join("\n")
    );
    process.exit(0);
  }

  console.log("→ Fetching candidate institutions from College Scorecard…");
  const pool: ScorecardRow[] = [];
  const pages = Math.ceil(CANDIDATE_POOL / PER_PAGE);
  for (let page = 0; page < pages; page++) {
    const rows = await fetchPage(page);
    if (rows.length === 0) break;
    pool.push(...rows);
    console.log(`  · page ${page + 1}: ${rows.length} rows (pool ${pool.length})`);
  }

  // Normalize, keep rows that have both cost figures the card leads with
  // (sticker + net) so every card shows a complete cost picture. Exclude
  // for-profit institutions — they're a different category (mostly online) that
  // doesn't fit a traditional college-list app and skews the ROI picture.
  const normalized = pool
    .map(normalize)
    .filter(
      (c): c is College =>
        c !== null &&
        c.control !== "private-forprofit" &&
        c.costOfAttendance != null &&
        c.netPrice != null
    );

  // De-dupe by id (pagination can overlap).
  const unique = Array.from(new Map(normalized.map((c) => [c.id, c])).values());

  const curated = stratifiedSample(unique, TARGET_COUNT).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    source:
      "U.S. Dept. of Education College Scorecard API (collegescorecard.ed.gov)",
    note: `Curated subset of ${curated.length} institutions, stratified across selectivity tiers.`,
    colleges: curated,
  };

  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `✓ Wrote ${curated.length} colleges to ${path.relative(process.cwd(), OUT_PATH)}`
  );
}

main().catch((err) => {
  console.error("✗ College Scorecard pull failed:", err.message);
  process.exit(1);
});
