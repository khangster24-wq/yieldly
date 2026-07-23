import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a dollar figure as compact USD, e.g. 28450 -> "$28,450". */
export function formatUSD(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a 0–1 rate as a whole percentage, e.g. 0.043 -> "4%". */
export function formatPercent(rate: number | null | undefined): string {
  if (rate == null || Number.isNaN(rate)) return "—";
  return `${Math.round(rate * 100)}%`;
}
