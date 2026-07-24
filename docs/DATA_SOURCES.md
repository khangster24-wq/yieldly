# Yieldly — Data Sources

## College data: College Scorecard API (primary source)

Use the **U.S. Department of Education's College Scorecard API** (collegescorecard.ed.gov/data/api) — free, public-domain, official government data covering 6,500+ institutions. This is exactly what the ROI/risk framing needs and gives the project real credibility (it's the same data source CollegeVine and similar tools are built on).

- **Access:** requires a free API key from api.data.gov (instant signup, no cost).
- **Fields relevant to Yieldly:**
  - Admission rate → feeds the **risk score**
  - Cost fields (see "Cost fields — don't blend these" below) → feeds **cost/ROI**
  - Median earnings 6/10 years after entry (institution-level and, where available, by field of study) → feeds **ROI/return**
  - Median cumulative debt at graduation → feeds **ROI**
  - Institution name, location, size, control (public/private) → feeds **discovery cards / filters**
- **Implementation approach:** don't call the live API on every request. Pull a curated subset (~150-300 well-known and diverse schools — mix of reach/target/safety across selectivity tiers, plus a range of costs) at build time, cache it as local JSON/SQLite, and refresh periodically. This keeps the app fast, avoids rate limits, and avoids a hard runtime dependency on an external API during a demo.
- **Docs:** collegescorecard.ed.gov/data/api-documentation and collegescorecard.ed.gov/data/api

### Cost fields — don't blend these

College Scorecard has two genuinely different cost numbers, and showing only one (or averaging them) is what produces misleadingly cheap-looking figures like "$20k/year" for a school where most people actually pay far more:

- **`cost.attendance.academic_year`** — full **sticker cost of attendance**: tuition + fees + books/supplies + room & board + personal/transportation costs, *before* any aid. This is the realistic number for a full-pay family and is usually the bigger, more expected-looking figure (often $50k-90k/year at expensive privates).
- **`cost.avg_net_price` / the `NPT4_PUB` / `NPT4_PRIV` fields, broken out by income bracket** — the **average net price** *specific schools' aid recipients actually paid*, already net of grants/scholarships, for Title IV federal-aid recipients in each income bracket (roughly: $0-30k, $30-48k, $48-75k, $75-110k, $110k+ family income). This is where a "$20k/year" figure legitimately comes from — it's real data, but it's the aid-adjusted average for a specific income bracket, not the sticker price, and isn't what a full-pay or non-aid-eligible family will pay.

**Yieldly must show both, clearly labeled** — e.g. "Sticker price: $78,000/yr" and "Estimated net price for your income bracket: $19,400/yr" side by side, using the income bracket the student enters at onboarding to pick the right net-price figure. Never show a single unlabeled "cost" number — that's the exact bug to fix if the app is currently displaying one figure with no context, and it's also a better product: showing the gap between sticker and net price *is* the financial-literacy story this app is supposed to tell.

### Top majors — `latest.academics.program_percentage.*`

Scorecard also publishes each institution's real share of bachelor's degrees awarded per 2-digit CIP category (e.g. `business_marketing: 0.17` = 17% of degrees). `scripts/fetch-majors.ts` pulls this for every already-cached school id (batched `id__in` queries, doesn't touch which schools are in the cache) and keeps the top 3 non-zero categories as `College.topMajors`, human-labeled from the real NCES CIP series titles — not an editorial "notable programs" list. Shown on the Portfolio detail view only (see `docs/ROADMAP.md` Phase 2 for why it doesn't fit the Discover card's fixed-height layout). US schools only — no equivalent per-institution dataset exists for the international schools in `src/lib/international-colleges.ts`, so `topMajors` stays honestly absent for those rather than guessed.

## Scholarship data: curated seed dataset (MVP approach)

There is no single clean, comprehensive, free scholarship API suitable for a student project (options like ScholarshipAPI, ScholarshipPortal, and ScholarshipOwl exist but are either regionally limited, require paid/partner access, or aren't built for this use case).

**Recommended MVP approach:** hand-curate a seed dataset of 40-80 real, well-known, broadly-applicable scholarships (name, amount, eligibility criteria, deadline, rough competitiveness) as a JSON file, sourced from publicly listed scholarship directories. This is honest (real scholarships, real data) and fully sufficient to demonstrate the "expected value ranking" concept (probability-weighted payout) without needing a live data pipeline. Document in-app that the list is a curated starting set, not exhaustive — this is a legitimate product choice, not a shortcut to hide.

Stretch goal (post-MVP, not required now): integrate a scholarship API/partner once one with better US coverage is confirmed available.

## AI College Counselor (scholarships & finance): Gemini API

Use the **Gemini API (Google)** for the AI advisor chat — runs on Google AI Studio's free tier (no credit card required), via the official `@google/genai` SDK. Feed it structured context on each request: the student's saved portfolio (schools, risk/return data), stated preferences/stats, the scholarship dataset (full or filtered to relevant matches), and a system prompt that defines the persona explicitly — e.g., "You are Yieldly's AI college counselor. Your specialty is scholarships and the financial side of college admissions (cost, aid, ROI) — lead with that lens and cite the actual numbers and scholarships passed to you. You can also answer general college-prep questions the student asks (deadlines, terminology, application basics) — don't refuse these, just don't let them be your default framing. Don't fabricate data, and don't give binding financial/legal advice." Requires a Gemini API key (developer sets this up separately at aistudio.google.com/apikey — not something to hardcode).

Keep the advisor's scope for MVP centered on scholarship strategy, financial aid/ROI explanation, and portfolio gap analysis with a financial lens, while still handling general admissions questions as a secondary capability (see `FEATURES.md` §4). Don't try to replicate a full essay-review counselor — that's out of scope per `PRD.md` — but the finance specialization is a lens on top of a genuinely useful general assistant, not a hard restriction.

## Data honesty note

Every number shown to the user that claims to be real (cost, earnings, admission rate) must trace back to College Scorecard data — never fabricate placeholder statistics in the shipped product. The risk score and ROI score, since they're Yieldly's own derived calculations (not raw government stats), should be clearly labeled as estimates (see scoring formulas in `FEATURES.md`).
