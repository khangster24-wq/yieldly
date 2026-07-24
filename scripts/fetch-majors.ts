/**
 * Yieldly — top-majors enrichment pass.
 *
 * Adds `topMajors` to the ALREADY-cached src/data/colleges.json (does not
 * re-curate the school list — that would risk shifting which 213 schools are
 * included and orphaning any saved portfolios). For each existing school id,
 * pulls College Scorecard's real `latest.academics.program_percentage.*`
 * fields (share of bachelor's degrees awarded per field, 2-digit CIP
 * category) and keeps the top 3 non-zero categories, human-labeled.
 *
 * Same API-key handling as fetch-colleges.ts: uses SCORECARD_API_KEY if set,
 * otherwise falls back to the public DEMO_KEY (rate-limited but sufficient
 * for a handful of batched id__in requests over 213 known ids).
 *
 * Run: npx tsx scripts/fetch-majors.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";

import type { College } from "../src/lib/types";

loadEnv({ path: ".env.local" });
loadEnv();

const API_KEY = process.env.SCORECARD_API_KEY || "DEMO_KEY";
const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools";
const OUT_PATH = path.resolve(process.cwd(), "src/data/colleges.json");
const BATCH_SIZE = 100;

/**
 * Scorecard's real 2-digit CIP program-percentage categories, mapped to the
 * actual NCES CIP series titles (not invented labels) — every key here is a
 * genuine field in `latest.academics.program_percentage`.
 */
const CATEGORY_LABELS: Record<string, string> = {
  agriculture: "Agriculture",
  resources: "Natural Resources & Conservation",
  architecture: "Architecture",
  ethnic_cultural_gender: "Area, Ethnic, Cultural & Gender Studies",
  communication: "Communication",
  communications_technology: "Communications Technology",
  computer: "Computer & Information Sciences",
  personal_culinary: "Personal & Culinary Services",
  education: "Education",
  engineering: "Engineering",
  engineering_technology: "Engineering Technology",
  language: "Foreign Languages & Literature",
  family_consumer_science: "Family & Consumer Sciences",
  legal: "Legal Professions",
  english: "English Language & Literature",
  humanities: "Liberal Arts & Humanities",
  library: "Library Science",
  biological: "Biological & Biomedical Sciences",
  mathematics: "Mathematics & Statistics",
  military: "Military Technologies",
  multidiscipline: "Multi/Interdisciplinary Studies",
  parks_recreation_fitness: "Parks, Recreation & Fitness Studies",
  philosophy_religious: "Philosophy & Religious Studies",
  theology_religious_vocation: "Theology & Religious Vocations",
  physical_science: "Physical Sciences",
  science_technology: "Science Technologies",
  psychology: "Psychology",
  security_law_enforcement: "Security & Law Enforcement",
  public_administration_social_service: "Public Administration & Social Service",
  social_science: "Social Sciences",
  construction: "Construction Trades",
  mechanic_repair_technology: "Mechanic & Repair Technologies",
  precision_production: "Precision Production",
  transportation: "Transportation & Materials Moving",
  visual_performing: "Visual & Performing Arts",
  health: "Health Professions",
  business_marketing: "Business & Marketing",
  history: "History",
};

const FIELDS = ["id", ...Object.keys(CATEGORY_LABELS).map((k) => `latest.academics.program_percentage.${k}`)].join(",");

/* eslint-disable @typescript-eslint/no-explicit-any */
type ScorecardRow = Record<string, any>;

function topMajorsFor(row: ScorecardRow): string[] {
  const shares = Object.keys(CATEGORY_LABELS)
    .map((key) => ({
      label: CATEGORY_LABELS[key],
      pct: Number(row[`latest.academics.program_percentage.${key}`] ?? 0),
    }))
    .filter((s) => s.pct > 0)
    .sort((a, b) => b.pct - a.pct);
  return shares.slice(0, 3).map((s) => s.label);
}

async function fetchBatch(ids: number[]): Promise<Map<number, string[]>> {
  const url = new URL(BASE_URL);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("per_page", String(BATCH_SIZE));
  url.searchParams.set("id__in", ids.join(","));

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Scorecard API ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  const json = (await res.json()) as { results: ScorecardRow[] };
  const out = new Map<number, string[]>();
  for (const row of json.results ?? []) {
    out.set(row.id, topMajorsFor(row));
  }
  return out;
}

async function main() {
  const raw = await readFile(OUT_PATH, "utf8");
  const payload = JSON.parse(raw) as { colleges: College[]; [k: string]: unknown };
  const colleges = payload.colleges;

  console.log(`→ Enriching ${colleges.length} cached schools with real top-majors data…`);
  const majorsById = new Map<number, string[]>();
  for (let i = 0; i < colleges.length; i += BATCH_SIZE) {
    const batchIds = colleges.slice(i, i + BATCH_SIZE).map((c) => c.id);
    const batch = await fetchBatch(batchIds);
    for (const [id, majors] of batch) majorsById.set(id, majors);
    console.log(`  · batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.size} schools enriched`);
  }

  let filled = 0;
  for (const college of colleges) {
    const majors = majorsById.get(college.id);
    if (majors && majors.length > 0) {
      college.topMajors = majors;
      filled++;
    }
  }

  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`✓ Added topMajors to ${filled}/${colleges.length} schools in ${path.relative(process.cwd(), OUT_PATH)}`);
}

main().catch((err) => {
  console.error("✗ Majors enrichment failed:", err.message);
  process.exit(1);
});
