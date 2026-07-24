# Yieldly — Feature Specs

## 1. Swipe Discovery

**What it is:** A Tinder-style card stack of colleges. Swipe right to add to Portfolio, left to pass, tap for a details view.

**Card content (front):**
- School name, location, photo/placeholder graphic
- **Cost — show both sticker price and estimated net price** (see `DATA_SOURCES.md` → "Cost fields — don't blend these"): sticker price from `cost.attendance.academic_year` (includes room & board), and estimated net price for the student's income bracket from the `NPT4` fields. Never show one unlabeled cost figure — the sticker-vs-net gap is core to the app's financial-literacy pitch.
- **Risk tier badge** (Reach / Target / Safety — see scoring below), color-coded (coral = reach/high risk, blue = target, lime = safety)
- **ROI signal** — a compact indicator (e.g., a 1-5 bar or a $ multiple) rather than a raw number, so it reads at a glance
- 2-3 short "vibe tags" (e.g., size, setting, public/private) for quick fit context

**Interaction:** real drag physics via `framer-motion` — card follows the finger/cursor, rotates slightly with drag distance, flings off-screen past a velocity/distance threshold, springs back if released short. Right-swipe triggers a small celebratory animation (brand gradient burst, not just an instant disappear) when the card is added to the Portfolio — this is a key "doesn't look cheap" moment, invest real effort here.

**Filters (pre-swipe):** let the student narrow the deck by rough cost ceiling, region, size, public/private before swiping — otherwise the deck is just the whole cached dataset in a fixed order, which won't feel personalized.

## 2. Risk/Return Engine + Portfolio Dashboard

**Risk score (the "chancing" logic):** Keep this a transparent, rules-based formula — do not claim or attempt a real ML model at this scope.

Suggested formula (documented and explainable):
- Base risk from the school's admission rate (lower rate = higher base risk).
- Adjust for the student's self-reported stats vs. the school's typical accepted range if you collect them during onboarding (GPA/SAT/ACT/IB score relative position — implemented in `src/lib/scoring.ts`). SAT compares directly against the school's real published average (ACT is converted to its SAT-equivalent first, via the official College Board/ACT concordance table in `src/lib/concordance.ts`, never combined with a directly-reported SAT); GPA and IB score compare against a selectivity-derived benchmark (no per-school GPA/IB averages exist to compare against), clearly documented as an estimate, not a published bar. If the student doesn't provide stats, fall back to admission-rate-only risk with a visible note that it's unpersonalized.
- Course rigor and extracurriculars are additional, deliberately bounded signals (small relative to GPA/SAT/IB), not benchmarked per-school: weighted-vs-unweighted GPA gap, AP exam results (real 42-course College Board catalog), and self-reported extracurriculars rated on a CollegeVine-style 1–4 tier framework with an in-app description per tier. Extracurriculars are explicitly labeled a guesstimate, since only the student self-assesses the tier — an admissions reader could weigh the same activity very differently.
- Bucket into three tiers: **Reach** (low admit probability), **Target** (roughly even odds), **Safety** (high admit probability). Label with a percentage-range estimate, and always show a disclaimer that this is an estimate, not a guarantee — matches the "honest, not black-box" positioning in `PRD.md`.

**ROI score (the "return" logic):**
- Combine estimated net price for the student's income bracket (not sticker price — net price is the realistic cost signal for this family; see `DATA_SOURCES.md`), median debt at graduation, and median earnings post-graduation into a simple, documented formula — e.g., a version of (post-grad earnings − annual cost impact) normalized into a 1-5 or letter-grade-style score.
- Show the underlying numbers (both sticker price and net price, real earnings) alongside the derived score — never show just a naked score with no way to see what produced it.

**Portfolio Dashboard:**
- Visual list/grid of all schools the student has swiped right on, grouped or color-coded by risk tier.
- **Diversification meter** — a simple visual (e.g., a horizontal stacked bar or radial chart via `recharts`) showing the reach/target/safety split of the current portfolio, with a clear "balanced / reach-heavy / safety-heavy" state and a one-line explanation of why balance matters (mirrors portfolio diversification in investing — say so explicitly in the copy, it's the concept payoff).
- Aggregate stats: average estimated cost, average ROI score across the portfolio.

## 3. Scholarship Yield Finder

**What it is:** A ranked list (not a plain directory) of scholarships from the curated seed dataset (`docs/DATA_SOURCES.md`).

**Ranking logic — "expected value":** `expected_value = estimated_win_probability × award_amount`. Estimate win probability heuristically from stated competitiveness/eligibility breadth of each scholarship (e.g., a small pool of listed eligibility factors → rough tiers: broad/low-competition, medium, highly competitive) — document the heuristic in code comments since, like the risk score, it should be explainable, not mysterious.

**UI:** a ranked list or swipeable secondary deck (reusing the swipe component for consistency) showing scholarship name, amount, estimated win likelihood tier, deadline, and expected-value framing ("high amount, low competition = strong yield" style copy, consistent with the app's voice).

**Matching to student:** filter/sort using whatever profile info is collected (major interest, state, basic eligibility flags) — doesn't need to be exhaustive for MVP, just relevant enough to feel personalized.

## 4. AI College Counselor — Finance & Scholarship Specialist (with general Q&A)

**What it is:** A chat panel (not a full separate app) that acts as a college counselor whose *specialty* is the financial side of admissions — scholarships, financial aid, and cost/ROI tradeoffs — grounded in the student's current Portfolio, profile, and the Scholarship Yield Finder data. It's not hard-walled to finance topics only: a student should be able to ask it basic general admissions questions too (deadlines, what a "target school" means, how the Common App works, etc.) and get a reasonable answer. The distinction from generic AI college-counselor products isn't "it refuses non-finance questions" — it's that finance/scholarships is its depth and default lens, the thing it's genuinely good at and steers toward, the way a real counselor with a finance background would naturally frame advice even when answering a broader question.

**Scope for MVP:**
- **Scholarship strategy (core specialty)** — "Which scholarships should I prioritize?", "Am I a strong fit for [scholarship]?", explain the expected-value ranking from the Scholarship Yield Finder in plain language, and surface scholarships from the seed dataset the student hasn't looked at yet that fit their profile.
- **Financial aid / cost guidance (core specialty)** — explain net price vs. sticker price for a saved school, what the ROI score is based on, and general (non-personalized-legal-advice) explanations of concepts like need-based vs. merit aid, using the real numbers already in context. Always frame this as educational, not formal financial/legal advice.
- **Portfolio gap analysis with a financial lens (core specialty)** — "How's my list looking?" should answer in terms of both admit-risk balance *and* financial balance (e.g., "your reach schools are also your most expensive — here's a target school that's both a stronger financial fit and a better admit chance").
- **General admissions Q&A (secondary, still supported)** — basic questions unrelated to money (application timelines, what admissions terms mean, how to interpret a saved school's stats) should still get a helpful, honest answer. Don't refuse or deflect these — just don't let them be the identity of the feature. Where a general question has a natural financial angle, it's fine (encouraged, even) to fold that in.

**Explicitly not in scope for MVP:** essay feedback/review, formal or binding financial/legal advice, multi-turn long-term memory across sessions (a single session's conversation is fine).

**Implementation:** system prompt should define the persona as a college counselor who specializes in scholarships and financial planning for admissions but is happy to help with general college-prep questions too, defaulting to a financial lens where relevant. Ground it in portfolio- and scholarship-data-grounded specifics in the Yieldly voice (see `DESIGN_SYSTEM.md` → Voice), and explicitly instruct it not to fabricate school or scholarship data or give binding financial/legal advice — only reference numbers actually present in the passed context.
