# Yieldly

Build your college list like an investment portfolio. Every school has a **risk**
(admission odds) and a **return** (financial ROI); the goal is a balanced,
diversified list. See [`docs/`](docs) for the full product spec.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · framer-motion ·
recharts · College Scorecard API · Gemini API

## Getting started

```bash
npm install
cp .env.example .env.local   # add API keys when you have them (optional to start)
npm run dev                  # http://localhost:3000
```

The app runs without any keys — Discover shows a designed "connect data" state
until the college dataset is pulled, and the Advisor shows a "connect the
counselor" state until a Gemini key is set.

## Loading real college data

The live cache (`src/data/colleges.json`) is **already populated with 213 real
institutions** — every cost, earnings, and admission figure is authentic U.S.
Dept. of Education College Scorecard data (for-profit schools excluded). Each
school carries both the **sticker cost of attendance** (before aid, incl. room &
board) and the **average net price** (after aid).

To refresh or expand the dataset:

1. Get a free key from [api.data.gov](https://api.data.gov/signup) (the initial
   pull used the public `DEMO_KEY`, which is rate-limited; your own key lifts that).
2. Add it to `.env.local`: `SCORECARD_API_KEY=...`
3. Re-run the pull:
   ```bash
   npm run data:colleges
   ```
   Without a key the script prints setup steps and exits cleanly, and the app
   falls back to the curated real-school seed set (`src/lib/seed-colleges.ts`).

## AI College Counselor

Set `GEMINI_API_KEY` in `.env.local` to enable the Phase 4 advisor (free tier —
get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
The key is read at runtime (`src/app/api/advisor/route.ts`) and never
hardcoded.

## Design system

All brand tokens (navy `#0B1F4D`, blue `#3B6BFF`, coral `#FF6B6B`, lime
`#C6FF6B`, radii, Poppins/Inter) live in [`tailwind.config.ts`](tailwind.config.ts)
and [`src/app/globals.css`](src/app/globals.css) — reference the tokens, never
raw hex. See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

## Build order

Following [`docs/ROADMAP.md`](docs/ROADMAP.md):

- **Phase 0 — Foundations** ✅ scaffold, design tokens, app shell, onboarding,
  data-pull script (stubbed on key), advisor integration wired.
- **Phase 1 — Swipe Discovery** ✅ card stack with real drag/fling physics
  (framer-motion), personalized + filtered deck, risk-tier/ROI card face, match
  burst, right-swipe persistence to the portfolio, designed empty states.
- **Phase 2 — Risk/Return Engine + Portfolio Dashboard** ✅ transparent scoring
  engine (`src/lib/scoring.ts`: admit-rate + GPA/SAT risk, income-bracket
  payback ROI), and the portfolio dashboard (`src/components/portfolio/`):
  recharts allocation donut with a balanced/reach-heavy/safety-heavy verdict,
  aggregate stats (yield / admit / net / sticker), a risk-vs-return scatter, and
  a tiered, removable school list.
- **Phase 3 — Scholarship Yield Finder** ✅ curated set of 46 real scholarships
  (`src/lib/scholarships-data.ts`) ranked by expected value (win odds × payout;
  documented heuristic in `src/lib/scholarships.ts`), with yield-tier framing,
  sort (yield/amount/deadline), and a field-specific "fits my major" filter.
- **Phase 4 — AI College Counselor** ✅ streaming chat UI
  (`src/components/advisor/`) grounded in the student's real scored portfolio,
  diversification summary, and yield-ranked scholarships
  (`src/lib/advisor-prompt.ts` reuses the same scoring/ranking engines the app
  displays, so the counselor cites identical numbers). Persona + hard rules in
  the system prompt (finance-first, cites only real data, no fabrication).
  Degrades gracefully to a "connect me" message when no `GEMINI_API_KEY` is set.
- Phase 5 — Polish pass
