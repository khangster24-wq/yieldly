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
- **Coursework and extracurriculars as chancing factors** — planned once beta feedback is in. Today `assessRisk()` (`src/lib/scoring.ts`) personalizes admit odds from GPA and SAT only; the plan is to extend the same transparent, rules-based approach (no ML) with course rigor (AP/IB/honors load) and extracurricular strength as additional signals in the same explainable formula, plus new fields on `StudentProfile` (`src/lib/types.ts`) and the profile edit screen (`src/app/settings/page.tsx`).
