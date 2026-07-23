import { MapPin, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SchoolArt } from "@/components/discover/school-art";
import type { RiskTier, ScoredCollege } from "@/lib/types";
import { cn, formatUSD } from "@/lib/utils";

// Tier dot colors for the badge that sits over the dark art banner.
const TIER_DOT: Record<RiskTier, string> = {
  reach: "bg-yieldly-coral",
  target: "bg-yieldly-blue",
  safety: "bg-[#5DAA1E]",
};
const TIER_TEXT: Record<RiskTier, string> = {
  reach: "text-yieldly-coralText",
  target: "text-yieldly-blue",
  safety: "text-[#3E6B00]",
};

/**
 * Compact ROI stat — a right-aligned column (label · 5-segment bar · grade) so
 * it sits beside the cost without crowding the dollar figure. Color follows ROI
 * strength: lime (strong) / blue (mid) / coral (weak) per the design system.
 */
function RoiMeter({ score, label }: { score: number; label: string }) {
  const color =
    score >= 4 ? "bg-yieldly-lime" : score === 3 ? "bg-yieldly-blue" : "bg-yieldly-coral";
  const text =
    score >= 4 ? "text-[#3E6B00]" : score === 3 ? "text-yieldly-blue" : "text-yieldly-coralText";
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span className="text-[11px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
        ROI
      </span>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-3.5 rounded-pill transition-colors",
              i < score ? color : "bg-secondary"
            )}
          />
        ))}
      </div>
      <span className={cn("font-heading text-xs font-bold", text)}>{label}</span>
    </div>
  );
}

/**
 * The discovery card face. Purely presentational — takes a ScoredCollege and
 * shows the real Scorecard numbers (net price, admit rate) alongside Yieldly's
 * clearly-labeled estimates (risk tier, ROI). Reused by both the draggable top
 * card and the static cards behind it.
 */
export function CollegeCard({ scored }: { scored: ScoredCollege }) {
  const { college, risk, roi, vibeTags } = scored;
  // Only worth a second line when net actually differs from sticker — most
  // international schools have no need-based aid, so net === sticker exactly
  // and a redundant "after aid: $X" (identical to the line above) is just noise.
  const hasAidDelta =
    roi.netPrice != null &&
    college.costOfAttendance != null &&
    Math.abs(roi.netPrice - college.costOfAttendance) > 500;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface-card shadow-card">
      {/* Banner */}
      <div className="relative h-[38%] shrink-0">
        <SchoolArt
          name={college.name}
          seed={college.id}
          imageUrl={college.imageUrl}
          className="h-full w-full"
        />
        {/* Risk tier badge floats over the art — solid pill for legibility on the dark banner */}
        <div className="absolute bottom-3 left-3">
          <div className="inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-2.5 py-1 shadow-card backdrop-blur">
            <span className={cn("size-2 rounded-pill", TIER_DOT[risk.tier])} />
            <span
              className={cn(
                "font-heading text-xs font-bold",
                TIER_TEXT[risk.tier]
              )}
            >
              {risk.label}
            </span>
          </div>
        </div>
      </div>

      {/* Body — justify-between spreads any slack evenly across the sections
          instead of pooling it above the disclaimer. */}
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5 p-5">
        <div>
          <h2 className="font-heading text-xl font-extrabold leading-tight text-navy line-clamp-2">
            {college.name}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {college.city}, {college.state}
          </p>
        </div>

        {/* Cost + ROI signal. Headline is the sticker (total cost of attendance
            BEFORE aid, incl. room & board), with "before aid" tied directly to
            the figure; the net-after-aid amount sits beneath so the aid gap is
            explicit. ROI is a right-aligned column so it never crowds the price. */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
              Total cost / yr
            </p>
            <p className="flex items-baseline gap-1.5">
              <span className="tabular font-heading text-2xl font-extrabold leading-none text-navy">
                {formatUSD(college.costOfAttendance ?? college.netPrice)}
              </span>
              <span className="text-[10px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
                {hasAidDelta ? "before aid" : "est. total"}
              </span>
            </p>
            {hasAidDelta && (
              <p className="mt-1 text-xs text-muted-foreground">
                ≈{" "}
                <span className="tabular font-bold text-[#3E6B00]">
                  {formatUSD(roi.netPrice)}
                </span>
                /yr {roi.incomeAdjusted ? "for your income" : "after aid"}
              </p>
            )}
          </div>
          <RoiMeter score={roi.score} label={roi.label} />
        </div>

        {/* Vibe tags */}
        <div className="flex flex-wrap gap-1.5">
          {vibeTags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Estimate disclaimer — honest-not-black-box. International schools get
            an extra line since their cost figures come from researched university
            fee schedules, not a single official database like U.S. Scorecard. */}
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[11px] leading-tight text-muted-foreground">
            <Info className="size-3 shrink-0" />
            Risk &amp; ROI are Yieldly estimates, not guarantees.
          </p>
          {college.country && (
            <p className="pl-[18px] text-[11px] leading-tight text-muted-foreground">
              Cost is a researched estimate (uni-published fees), not an official
              government database like the U.S. figures.
            </p>
          )}
          {college.costNote && (
            <p className="pl-[18px] text-[11px] leading-tight text-muted-foreground">
              {college.costNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
