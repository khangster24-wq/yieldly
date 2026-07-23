# Yieldly — Build Instructions for Claude Code

Yieldly is a college research and application-prep app that treats building a college list like building an investment portfolio: every school has a risk (admission chance) and a return (financial ROI), and the goal is a balanced, diversified list. It's being built by a high school student (aspiring international business/finance major) as a polished extracurricular project — the whole point is that the finance framing is genuine, not decorative, so every feature should reinforce it.

Read the files in `docs/` before writing code, in this order:

1. `docs/PRD.md` — what we're building and why. Read this first, always.
2. `docs/DESIGN_SYSTEM.md` — colors, type, component style, logo usage. Non-negotiable — this app must look premium, not like a generic template.
3. `docs/FEATURES.md` — detailed spec for each of the 4 MVP pillars.
4. `docs/DATA_SOURCES.md` — where real data comes from (College Scorecard API, seed scholarship data, Claude API for the advisor) and how to wire it in.
5. `docs/ROADMAP.md` — build order. Follow this sequence; don't skip ahead to later phases before earlier ones are solid.

## Ground rules

- **Scope discipline.** This is a lean MVP with exactly 4 features, done well: (1) swipe discovery, (2) risk/return chancing engine + portfolio dashboard, (3) scholarship yield finder, (4) an AI college counselor that leads with scholarships and financial/ROI strategy but still handles general admissions questions. Do not add a 5th feature (essay review, reviews/rankings, quiz, social layer) unless explicitly asked — depth over breadth is the whole strategy here.
- **Aesthetics matter more than feature count.** The student's explicit priority is that this "not look cheap." Favor: real motion/transitions (especially on the swipe cards), consistent spacing, a genuine design system (not ad-hoc Tailwind classes), and empty/loading/error states that are actually designed, not afterthoughts. Do not ship placeholder gray boxes or lorem ipsum in the final pass.
- **Tech stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, deployed as a responsive web app (mobile-first, works great in a browser — no native app store submission required for a demo/portfolio project). Use `framer-motion` for the swipe card physics and page transitions. Use `recharts` for the portfolio dashboard charts.
- **Data is real, not fake.** Use the College Scorecard API (see `docs/DATA_SOURCES.md`) for actual cost, admission rate, and earnings data. Do not invent placeholder college data in the shipped product — a small cached/curated dataset of real schools (~150-300) pulled from the real API is the right scope, not fabricated numbers.
- **Chancing/risk score must be explainable.** Do not build or claim a "machine learning model" — that's not honest at this scope and doesn't hold up under scrutiny. Build a transparent, rules-based scoring algorithm (documented in `docs/FEATURES.md`) and label it clearly as an estimate. This is actually a selling point: explainable > black box.
- **Brand consistency.** Every screen uses the Yieldly color system and the logo assets in `assets/`. Don't introduce colors outside the defined palette.
- **This is a student portfolio project.** Code should be clean and readable (this may get reviewed by a teacher, judge, or in a college application), not just "working." Comment non-obvious logic, especially the scoring/ROI math — that's the part that demonstrates the finance thinking.

## When something in these docs is ambiguous

Make the decision that best serves "looks premium, ships working, stays honest about what's real data vs. estimate." If a genuine product decision is needed (not just implementation detail), flag it clearly rather than guessing silently.
