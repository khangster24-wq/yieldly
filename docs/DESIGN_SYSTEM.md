# Yieldly — Design System

Direction: **modern fintech meets playful Gen Z.** Confident and credible like a fintech app (Robinhood/Cash App energy), but warm and expressive, not corporate — this is being used by 16-18 year olds, not investment bankers.

## Logo

**Final logo — use this one:** `assets/Yieldly_Logo_Full_Final.png` — a navy rounded-square "Y" monogram (the Y's strokes form an upward arrow, with a coral accent dot) paired with the "yieldly" wordmark in bold rounded lowercase. This is the approved brand mark; use it in headers, splash/loading screens, the browser tab favicon (crop to the icon square only), and any marketing/pitch materials.

`Yieldly_Icon.svg` and `Yieldly_Logo_Full.svg` are earlier concept drafts (an uptrend-line-into-chevron mark) kept for reference only — do not use them in the shipped product; they're superseded by the final PNG above.

For a true app-icon crop (square, icon only, no wordmark), crop the navy square mark from the left side of `Yieldly_Logo_Full_Final.png`; if a clean vector/transparent-background version is needed later, that can be re-generated from this same concept.

Keep clear space around the mark roughly equal to the height of the coral dot. Don't recolor the icon outside the palette below. Don't stretch — lock aspect ratio.

## Color palette

| Token | Hex | Use |
|---|---|---|
| `yieldly-blue` | `#3B6BFF` | Primary brand color — primary buttons, active states, links, key data highlights |
| `yieldly-navy` | `#0B1F4D` | Primary text, dark backgrounds, headers |
| `yieldly-coral` | `#FF6B6B` | Accent — the "Gen Z pop." Use sparingly: badges, the match/like state, alerts, the diversification meter's "needs balance" state |
| `yieldly-lime` (optional secondary accent) | `#C6FF6B` | Positive/success states — "good ROI," "strong match," growth indicators |
| `surface` | `#F7F9FF` | App background (soft blue-white, not stark white) |
| `surface-card` | `#FFFFFF` | Card backgrounds |
| `border` | `#E3E8FA` | Hairlines, dividers |
| `text-muted` | `#5B6B96` | Secondary text |

Gradient for hero/brand moments: `linear-gradient(135deg, #3B6BFF, #1533A6)` (same gradient as the logo icon background) — use for the splash screen, onboarding, and the swipe card's "match" animation burst.

Do not introduce other hues (no purple, no teal, no random accent colors) — the fintech-credible feel depends on a tight palette.

## Typography

- Headings: a bold, rounded-but-confident sans-serif — **Poppins** or **Manrope**, weight 700-800. This is what carries the "playful fintech" feel.
- Body: **Inter** or **Manrope**, weight 400-500, for readability at small sizes (this is a data-dense app — legibility matters).
- Numbers/data (prices, scores, percentages): use tabular figures, slightly bolder weight than surrounding body text, and always pair with the right color semantics (coral/red for risk warnings, lime/green for strong ROI, blue for neutral info).

## Components & feel

- **Corners:** rounded, generous radius (16-24px on cards, full-round on pills/badges/buttons) — matches the rounded-square logo.
- **Shadows:** soft, colored shadows (a faint blue-tinted shadow, not flat gray) on cards to feel "lifted" and premium, not flat/cheap.
- **Motion:** this is the single highest-leverage aesthetic investment given the swipe-based core loop. The swipe card must have real physics (drag, rotation on drag, velocity-based fling, spring-back if released short) — use `framer-motion`'s drag + gesture APIs. A cheap-feeling instant-snap swipe will undercut the whole product; budget real time for this.
- **Data visualization:** the portfolio dashboard (diversification meter, risk/return scatter or bar) should use the palette above via `recharts`, with smooth enter animations, not static charts.
- **Empty/loading/error states:** design these deliberately (a friendly illustration or icon + short copy in brand voice), never a bare spinner or blank screen — cheap-feeling apps skip this.
- **Iconography:** rounded, consistent stroke-width line icons (e.g., Lucide, which ships with shadcn/ui) — don't mix icon styles.

## Voice

Confident, plain-spoken, a little playful — talk to the student like a smart friend who's good with money, not like a corporate advisor. Examples: "Your portfolio's looking reach-heavy — let's balance it out" rather than "Your application strategy exhibits elevated risk concentration."
