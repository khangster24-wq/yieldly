"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card } from "@/components/ui/card";
import { TIER_META, TIER_ORDER } from "@/lib/tiers";
import type { PortfolioSummary, Tone } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

const TONE_BADGE: Record<Tone, string> = {
  good: "bg-yieldly-lime/25 text-[#3E6B00]",
  warn: "bg-yieldly-coral/15 text-yieldly-coralText",
  neutral: "bg-yieldly-blue/10 text-yieldly-blue",
};

/**
 * Diversification meter (docs/FEATURES.md §2) — a portfolio-allocation donut of
 * the reach/target/safety split, with a verdict and a one-line explanation that
 * names the investing analogy. The concept payoff of the whole app.
 */
export function DiversificationMeter({ summary }: { summary: PortfolioSummary }) {
  const { tierCounts, diversification, count } = summary;

  const data = TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_META[tier].label,
    value: tierCounts[tier],
  })).filter((d) => d.value > 0);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        {/* Allocation donut with the count in the hole */}
        <div className="relative size-[132px] shrink-0">
          <PieChart width={132} height={132}>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={data.length > 1 ? 3 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              animationDuration={600}
            >
              {data.map((d) => (
                <Cell key={d.tier} fill={TIER_META[d.tier].chartHex} />
              ))}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="tabular font-heading text-3xl font-extrabold leading-none text-navy">
                {count}
              </div>
              <div className="mt-0.5 text-[10px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
                {count === 1 ? "school" : "schools"}
              </div>
            </div>
          </div>
        </div>

        {/* Verdict + legend */}
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "inline-flex rounded-pill px-2.5 py-1 font-heading text-xs font-bold",
              TONE_BADGE[diversification.tone]
            )}
          >
            {diversification.label}
          </span>
          <div className="mt-2.5 space-y-1.5">
            {TIER_ORDER.map((tier) => (
              <div key={tier} className="flex items-center gap-2 text-sm">
                <span className={cn("size-2.5 rounded-pill", TIER_META[tier].dot)} />
                <span className="font-heading font-semibold text-navy">
                  {TIER_META[tier].label}
                </span>
                <span className="tabular ml-auto font-heading font-bold text-navy">
                  {tierCounts[tier]}
                </span>
                <span className="tabular w-9 text-right text-xs text-muted-foreground">
                  {count > 0 ? Math.round((tierCounts[tier] / count) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {diversification.message && (
        <p className="mt-4 border-t border-hairline pt-3 text-sm leading-snug text-muted-foreground">
          {diversification.message}
        </p>
      )}
    </Card>
  );
}
