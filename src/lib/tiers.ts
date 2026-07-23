import type { RiskTier } from "@/lib/types";

/**
 * Single source of truth for risk-tier presentation — coral (reach/high risk),
 * blue (target), lime-green (safety), per docs/DESIGN_SYSTEM.md. `chartHex` is a
 * chart-legible fill (the pale brand lime washes out on white, so charts use a
 * more saturated lime-green while text stays dark green for contrast).
 */
export const TIER_META: Record<
  RiskTier,
  {
    label: string;
    chartHex: string;
    dot: string;
    text: string;
    softBg: string;
    border: string;
  }
> = {
  reach: {
    label: "Reach",
    chartHex: "#FF6B6B",
    dot: "bg-yieldly-coral",
    text: "text-yieldly-coralText",
    softBg: "bg-yieldly-coral/10",
    border: "border-yieldly-coral/30",
  },
  target: {
    label: "Target",
    chartHex: "#3B6BFF",
    dot: "bg-yieldly-blue",
    text: "text-yieldly-blue",
    softBg: "bg-yieldly-blue/10",
    border: "border-yieldly-blue/30",
  },
  safety: {
    label: "Safety",
    chartHex: "#8FD14F",
    dot: "bg-[#7BBE33]",
    text: "text-[#3E6B00]",
    softBg: "bg-yieldly-lime/25",
    border: "border-[#7BBE33]/40",
  },
};

/** Reach → Target → Safety, the order the dashboard presents tiers in. */
export const TIER_ORDER: RiskTier[] = ["reach", "target", "safety"];
