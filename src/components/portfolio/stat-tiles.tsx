import { Card } from "@/components/ui/card";
import type { PortfolioSummary } from "@/lib/portfolio";
import { cn, formatUSD, formatPercent } from "@/lib/utils";

/** Aggregate portfolio stats (docs/FEATURES.md §2) as a 2×2 tile grid. */
export function StatTiles({ summary }: { summary: PortfolioSummary }) {
  const yieldScore = summary.avgRoiScore;
  const yieldColor =
    yieldScore == null
      ? "text-navy"
      : yieldScore >= 3.5
      ? "text-[#3E6B00]"
      : yieldScore >= 2.5
      ? "text-yieldly-blue"
      : "text-yieldly-coralText";

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile
        label="Portfolio yield"
        hint="avg ROI"
        value={summary.yieldLabel}
        sub={yieldScore != null ? `${yieldScore.toFixed(1)} / 5 avg` : "—"}
        valueClassName={yieldColor}
      />
      <Tile
        label="Avg admit chance"
        hint="your odds"
        value={
          summary.avgAdmitChance != null
            ? formatPercent(summary.avgAdmitChance)
            : "—"
        }
        sub="across your list"
      />
      <Tile
        label="Avg net cost"
        hint="after aid"
        value={summary.avgNetPrice != null ? formatUSD(summary.avgNetPrice) : "—"}
        sub="per year"
      />
      <Tile
        label="Avg sticker"
        hint="before aid"
        value={
          summary.avgStickerPrice != null
            ? formatUSD(summary.avgStickerPrice)
            : "—"
        }
        sub="per year"
      />
    </div>
  );
}

function Tile({
  label,
  hint,
  value,
  sub,
  valueClassName,
}: {
  label: string;
  hint: string;
  value: string;
  sub: string;
  valueClassName?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-1">
        <p className="text-[11px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      </div>
      <p
        className={cn(
          "tabular mt-1 font-heading text-2xl font-extrabold leading-none text-navy",
          valueClassName
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
