# Yieldly — Build Roadmap

Follow this order. Each phase should be genuinely finished (working + styled per `DESIGN_SYSTEM.md`) before moving to the next — a half-finished Phase 4 is worth less than a polished Phase 2 for a project meant to demonstrate craft.

## Phase 0 — Foundations
- Scaffold Next.js + TypeScript + Tailwind + shadcn/ui project.
- Set up the design system as actual Tailwind theme tokens (colors, radii, fonts from `DESIGN_SYSTEM.md`) — not one-off hex codes scattered through components.
- Get a College Scorecard API key, pull and cache a curated dataset of ~150-300 schools (mix of selectivity tiers, costs, regions) as local JSON per `DATA_SOURCES.md`.
- Basic app shell: navigation, the four main sections (Discover, Portfolio, Scholarships, Advisor), onboarding flow to collect student stats/preferences (GPA/test score range, budget ceiling, region, major interest — used across all four features).

## Phase 1 — Swipe Discovery
- Build the card component and stack UI.
- Implement real drag/fling physics with `framer-motion` (see `FEATURES.md` §1) — this is the single most important polish item since it's the app's signature interaction.
- Wire cards to the cached college dataset, apply pre-swipe filters.
- Right-swipe writes to the Portfolio; add the match/celebration animation.

## Phase 2 — Risk/Return Engine + Portfolio Dashboard
- Implement the risk scoring formula and ROI scoring formula (documented, rules-based — see `FEATURES.md` §2).
- Surface risk tier + ROI signal on the discovery cards (this connects back into Phase 1).
- Build the Portfolio view: saved schools grouped/tiered, aggregate stats, and the diversification meter visualization with `recharts`.
- **Post-launch addition:** IB Diploma score (0–45) added as a third personalization stat alongside GPA/SAT — collected in onboarding and the profile settings screen, factored into `estimateAdmitProbability()` (`src/lib/scoring.ts`) via a selectivity-derived benchmark, same honest approach as the GPA benchmark (no real per-school IB average exists to compare against). Added specifically because Yieldly's international-schools set targets IB-diploma students, so this stat matters more here than in a US-only chancing tool.
- **Post-launch addition:** ACT score added as a fourth stat. Converted to its SAT-equivalent via the official 2018 College Board/ACT concordance table (`src/lib/concordance.ts`, values copied directly from the published table — not estimated) before feeding the existing SAT-vs-school-average signal, so it's never double-counted alongside a directly-reported SAT.
- **Chancing methodology researched against real competitors** (CollegeVine, Scoir, Naviance, Cappex, U.S. News) to ground the formula's rigor: CollegeVine/Scoir are proprietary ML models trained on 100k+ / tens-of-millions of real historical outcomes with published aggregate-calibration stats but no public feature weights — a different tier of resourcing Yieldly can't replicate. Yieldly's positioning stays deliberately the opposite: a fully transparent, documented, rules-based formula (every line readable in `src/lib/scoring.ts`), consistent with `PRD.md`'s "honest, not black-box" stance. Confirmed the ACT/SAT concordance table used above is the same official joint College Board/ACT artifact, not an approximation.
- **Real bug fixed:** international schools measured on earlier-career earnings (UK's ~5-yr LEO data, Australia's ~3-yr QILT data) were scoring "Weak" ROI purely as an artifact of the payback formula being calibrated around the US 10-year figure — not a true reflection of financial return. Added `RoiAssessment.caveat`, surfaced prominently on both the Discover card and Portfolio detail (not just buried in small print), and passed to the AI counselor so it explains the timeframe mismatch instead of calling a school a weak financial choice on that basis alone.
- **Post-launch addition:** weighted GPA, AP classes (real official College Board 42-course catalog, `src/lib/ap-subjects.ts`), and self-reported extracurriculars (CollegeVine-style 1–4 tier framework, `src/lib/extracurricular-tiers.ts`) added as three more chancing inputs, collected via new onboarding steps and settings sections. All three are bounded, documented heuristics, not benchmarked against invented per-school data:
  - Weighted GPA uses the gap vs. unweighted GPA (not the absolute number) as a rigor signal, since weighting scales vary by school with no honest single benchmark to compare against.
  - AP classes: each scored exam contributes `(score − 3) × 0.25` to a rigor signal; an unscored/in-progress class contributes a flat `+0.1`. Capped ±2.5 combined with the weighted-GPA gap.
  - Extracurriculars: tier-weighted (Tier 1 = 1.2 → Tier 4 = 0.1), with each additional activity beyond the strongest discounted 30% per step so one standout counts far more than a long list of minor ones — capped at +2.0. Onboarding/settings both carry an explicit disclaimer that this is a self-reported guesstimate, not how an actual admissions reader would weigh it.
  - Both new steps carry a disclaimer that IB-track students should skip the AP page — it's neutral (not penalized) if left empty.
- **Post-launch addition: "Suggested for you"** (`src/lib/suggestions.ts`, `src/components/portfolio/suggested-schools.tsx`) — a horizontal strip on Portfolio (both empty and populated states) recommending schools not yet saved. Not a new model: it re-ranks the same real, already-computed risk/ROI scores by (1) real ROI, (2) whether the school fills a risk tier the student's list is genuinely short on (using the same diversification logic the dashboard itself shows, once there are ≥3 saved schools to diagnose a real gap from), and (3) a soft bonus for matching the student's stated region. Each suggestion carries a one-line, honest reason ("You're short on target schools — this fills that gap."). Verified live: with 3 saved reach-only schools, suggestions correctly shifted to target-tier picks with that exact reasoning.
- **Post-launch addition: real top-majors data** — `scripts/fetch-majors.ts` enriches the *already-cached* `src/data/colleges.json` (213 US schools) with `topMajors`, pulled from College Scorecard's real `latest.academics.program_percentage.*` fields (real share of bachelor's degrees awarded per 2-digit CIP category, not editorial) via `id__in` batch queries against the existing school ids — deliberately does not re-curate the school list, since that could shift which schools are included and orphan saved portfolios. Run once already (3 batched requests on the public DEMO_KEY covered all 213 schools); re-run with `npm run data:majors` to refresh. Shown in the Portfolio detail view. Deliberately NOT added to the Discover card — a real layout bug was caught live (the swipe card's fixed-height flex container silently squeezed the added line to ~4px tall, invisible but still in the DOM) and reverted rather than force a fix into an already-tuned, fixed-aspect-ratio component. International schools don't have this yet — no per-institution Scorecard-equivalent dataset exists for them, so `topMajors` stays honestly absent rather than estimated.

## Phase 3 — Scholarship Yield Finder
- Build the curated scholarship seed dataset (`DATA_SOURCES.md`).
- Implement the expected-value ranking heuristic.
- Build the list/deck UI, reusing swipe-card styling for visual consistency with Phase 1.

## Phase 4 — AI Portfolio Advisor
- Set up Claude API integration.
- Build the chat panel UI (consistent with the rest of the app's visual language — not a bolted-on generic chat widget).
- Write and tune the system prompt to enforce portfolio-grounded, specific answers (see `FEATURES.md` §4).
- Test that it correctly references real saved-portfolio numbers, not hallucinated ones.

## Phase 5 — Polish pass (do not skip)
- Full pass on empty/loading/error states across all four sections.
- Responsive QA (this needs to look good on a phone screen — it's a swipe app, mobile is the primary surface even if built as a responsive web app).
- Motion/transition audit — page transitions, button states, nothing should feel static or default-Tailwind.
- Accessibility pass: color contrast (check coral/blue against backgrounds), keyboard navigation for the swipe cards (buttons as a fallback to dragging), alt text.
- Add the logo/app icon (`assets/`) to favicon, header, and any splash/loading screen.
- Prepare a short demo script or walkthrough (useful for presenting this for the extracurricular/application context) that explicitly narrates the finance-concept mapping from `PRD.md` — this is the story that makes the project stand out, so make sure the finished app can actually tell it in a 2-minute walkthrough.

## Suggested pacing

For a solo high-school build alongside schoolwork, roughly: Phase 0 (1 week), Phase 1 (1-2 weeks), Phase 2 (1-2 weeks), Phase 3 (3-5 days), Phase 4 (3-5 days), Phase 5 (1 week, don't compress this one). Total: roughly 6-9 weeks part-time. Adjust freely — the phase order matters more than the exact timing.

## Future / post-MVP (explicitly not now)
- AI-assisted essay review
- Standalone major/fit quiz
- Verified peer reviews
- Social/friends comparison layer
- Live scholarship API integration beyond the curated seed set
