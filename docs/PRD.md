# Yieldly — Product Requirements

## The problem

Existing college research tools each own one lane and are weak or absent everywhere else:

- **CollegeVine** owns admissions chancing (a 75-factor calculator) and essay review, but its ROI/financial framing is thin and its premium advising (~$1,300 avg.) prices out lower-income students.
- **Niche** owns rankings and reviews, but its reviews are widely reported as filtered/skewed positive, undermining trust.
- **CollegeSwipe** (a small indie app) proved a Tinder-style swipe mechanic works for college discovery, but it's a shallow feature set built by a tiny team — no real chancing rigor, no serious financial data.

None of them treat cost and financial outcome as a first-class citizen alongside admission odds. That's the gap Yieldly fills — and it's a gap a finance-minded student is uniquely positioned to notice and solve.

## The concept

**Treat a college list like an investment portfolio.** Every finance concept maps cleanly onto the college search:

| Finance concept | Yieldly equivalent |
|---|---|
| Risk of an asset | Admission chance (harder school = higher risk) |
| Return of an asset | Net cost vs. financial/career outcome (ROI) |
| Portfolio diversification | A balanced mix of reach / target / safety schools |
| Expected value | Probability of admission × value of the outcome |
| Yield | The overall "return" your list is generating |

This isn't a skin over a generic app — it should visibly shape the UI (a "portfolio" the student builds, a "diversification meter," "yield scores") and the actual algorithms (see `FEATURES.md`).

## Target user

A U.S. high school junior/senior building their college list, roughly the same profile as the student building this app: wants a fast, low-friction way to explore schools, wants real numbers (not vibes) about what a school will actually cost and lead to, and is turned off by clunky, dated-feeling tools (which most existing college-search sites are).

## MVP scope — 4 pillars, done well

1. **Swipe Discovery** — Tinder-style cards for browsing colleges, each showing net price, ROI signal, and risk tier at a glance. Right swipe adds to your Portfolio.
2. **Risk/Return Engine + Portfolio Dashboard** — a transparent chancing/risk score per school, an ROI estimate (cost vs. outcome), and a dashboard visualizing the whole portfolio with a diversification meter (are you too reach-heavy or too safety-heavy?).
3. **Scholarship Yield Finder** — a curated set of real scholarships, ranked by expected value (estimated win likelihood × payout), not just an alphabetical list.
4. **AI College Counselor (finance & scholarship specialist, general Q&A supported)** — a chat assistant that reasons over the student's actual portfolio, profile, and scholarship data, leading with scholarship strategy and financial/ROI guidance ("you're overweight in reaches — here are two undervalued targets that fit your stats and budget, plus two scholarships you're a strong fit for") but still able to answer everyday admissions questions the student throws at it. Every other AI college-counselor product on the market is generically broad with no real depth anywhere; Yieldly's is broadly useful *and* genuinely expert on money, which is both more useful and more defensible as "why does this app exist."

Explicitly out of scope for v1 (documented for later, not built now): essay review, a standalone fit/major quiz, a social/friends layer, crowdsourced reviews.

## Success criteria for this project

This is an extracurricular portfolio piece, so "success" means: it looks and feels like a real, funded startup's app (not a class project), the core swipe → portfolio → advisor loop works end to end with real data, and the finance framing is evident and defensible if a judge or admissions reader asks "why did you build it this way?" — the answer should be the risk/return/diversification logic in `FEATURES.md`, not just "it's a college app."
