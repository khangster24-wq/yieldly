"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { TIER_META, TIER_ORDER } from "@/lib/tiers";
import type { TierBuckets } from "@/lib/portfolio";
import type { RiskTier } from "@/lib/types";

interface Point {
  x: number; // admit chance %
  y: number; // ROI score 1–5
  name: string;
  tier: RiskTier;
}

/**
 * Risk vs. return map — plots every saved school by estimated admit chance (x)
 * against ROI (y), colored by tier. This is the literal "portfolio on a
 * risk/return plot" that makes the finance framing tangible (docs/PRD.md,
 * DESIGN_SYSTEM.md). Schools without an admit estimate are noted, not faked.
 */
export function RiskReturnScatter({ buckets }: { buckets: TierBuckets }) {
  const series = TIER_ORDER.map((tier) => ({
    tier,
    points: buckets[tier]
      .filter((s) => s.risk.admitProbability != null)
      .map<Point>((s) => ({
        x: Math.round((s.risk.admitProbability as number) * 100),
        y: s.roi.score,
        name: s.college.name,
        tier,
      })),
  }));

  const plotted = series.reduce((n, s) => n + s.points.length, 0);
  const total = TIER_ORDER.reduce((n, t) => n + buckets[t].length, 0);
  const unplotted = total - plotted;

  if (plotted === 0) return null;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-base font-bold text-navy">
          Risk vs. return map
        </h2>
        <span className="text-xs text-muted-foreground">your list, plotted</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        →&nbsp;right = better admit odds · ↑&nbsp;up = stronger ROI. The top-right
        corner is your safest value.
      </p>

      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 12, bottom: 18, left: -6 }}>
            <CartesianGrid stroke="#E3E8FA" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "#5B6B96" }}
              tickLine={false}
              axisLine={{ stroke: "#E3E8FA" }}
              label={{
                value: "Admit chance",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 10, fill: "#5B6B96", fontWeight: 600 },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: "#5B6B96" }}
              tickLine={false}
              axisLine={{ stroke: "#E3E8FA" }}
              label={{
                value: "ROI",
                angle: -90,
                position: "insideLeft",
                offset: 16,
                style: { fontSize: 10, fill: "#5B6B96", fontWeight: 600 },
              }}
            />
            <ZAxis type="number" range={[70, 70]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#B9C4E8" }}
              content={<PointTooltip />}
            />
            {series.map((s) => (
              <Scatter
                key={s.tier}
                data={s.points}
                fill={TIER_META[s.tier].chartHex}
                fillOpacity={0.85}
                animationDuration={500}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {unplotted > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {unplotted} school{unplotted === 1 ? "" : "s"} not shown — no published
          admit rate to estimate from.
        </p>
      )}
    </Card>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function PointTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: Point = payload[0].payload;
  return (
    <div className="rounded-xl border border-hairline bg-surface-card px-3 py-2 shadow-card">
      <p className="max-w-[180px] font-heading text-xs font-bold text-navy">
        {p.name}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        ~{p.x}% admit · ROI {p.y}/5
      </p>
    </div>
  );
}
