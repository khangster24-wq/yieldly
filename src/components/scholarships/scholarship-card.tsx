"use client";

import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ODDS_LABEL, type ScoredScholarship, type YieldTier } from "@/lib/scholarships";
import type { Competitiveness } from "@/lib/scholarships";
import { cn, formatUSD } from "@/lib/utils";

// Yield tier → color treatment (the "return" framing, per the design system).
const YIELD_STYLE: Record<YieldTier, { badge: string; text: string }> = {
  strong: { badge: "bg-yieldly-lime/25 text-[#3E6B00]", text: "text-[#3E6B00]" },
  solid: { badge: "bg-yieldly-blue/12 text-yieldly-blue", text: "text-yieldly-blue" },
  fair: { badge: "bg-secondary text-muted-foreground", text: "text-muted-foreground" },
  longshot: { badge: "bg-yieldly-coral/15 text-yieldly-coralText", text: "text-yieldly-coralText" },
};

// Odds tier → dot color (green = better odds, coral = long odds).
const ODDS_DOT: Record<Competitiveness, string> = {
  broad: "bg-[#7BBE33]",
  moderate: "bg-yieldly-blue",
  competitive: "bg-yieldly-coral",
  elite: "bg-yieldly-coral",
  lottery: "bg-muted-foreground",
};

/**
 * One scholarship in the ranked list. Leads with the yield framing (expected
 * value) rather than the raw amount — the whole thesis of the finder.
 */
export function ScholarshipCard({
  scored,
  rank,
}: {
  scored: ScoredScholarship;
  rank: number;
}) {
  const { scholarship, expectedValue, yieldTier, yieldLabel, matchesProfile, winProbability } =
    scored;
  const ys = YIELD_STYLE[yieldTier];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="tabular font-heading text-xs font-bold text-muted-foreground">
              #{rank}
            </span>
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 font-heading text-xs font-bold",
                ys.badge
              )}
            >
              {yieldLabel}
            </span>
            {matchesProfile && (
              <Badge variant="target" className="gap-1">
                <Sparkles className="size-3" />
                Fits your major
              </Badge>
            )}
          </div>
          <h3 className="mt-1.5 font-heading text-base font-bold leading-tight text-navy">
            {scholarship.name}
          </h3>
          <p className="text-xs text-muted-foreground">{scholarship.provider}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="tabular font-heading text-xl font-extrabold leading-none text-navy">
            {formatUSD(scholarship.amount)}
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            {scholarship.deadline}
          </p>
        </div>
      </div>

      {/* Odds + expected value — the two numbers behind the yield tier. */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn("size-2 rounded-pill", ODDS_DOT[scholarship.competitiveness])}
          />
          {ODDS_LABEL[scholarship.competitiveness]}
          <span className="tabular">
            (~{(winProbability * 100).toFixed(winProbability < 0.01 ? 2 : 1)}%)
          </span>
        </span>
        <span className="text-xs">
          <span className="text-muted-foreground">Expected value </span>
          <span className={cn("tabular font-heading font-bold", ys.text)}>
            ≈ {formatUSD(expectedValue)}
          </span>
        </span>
      </div>

      <p className="mt-2.5 text-xs leading-snug text-muted-foreground">
        {scholarship.blurb}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {scholarship.eligibility.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
        <a
          href={scholarship.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-0.5 font-heading text-xs font-bold text-yieldly-blue hover:underline"
        >
          Apply
          <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
        </a>
      </div>
    </Card>
  );
}
