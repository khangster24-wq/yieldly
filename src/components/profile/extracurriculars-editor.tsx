"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EXTRACURRICULAR_CATEGORIES, TIER_DESCRIPTIONS } from "@/lib/extracurricular-tiers";
import type { ExtracurricularEntry, ExtracurricularTier } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Add/remove list of extracurriculars + self-assessed tier, shared by
 * onboarding and profile settings. Feeds the extracurricular chancing signal
 * in src/lib/scoring.ts. Tier framework cited in src/lib/extracurricular-tiers.ts.
 */
export function ExtracurricularsEditor({
  value,
  onChange,
}: {
  value: ExtracurricularEntry[];
  onChange: (next: ExtracurricularEntry[]) => void;
}) {
  const [category, setCategory] = useState(EXTRACURRICULAR_CATEGORIES[0]);
  const [detail, setDetail] = useState("");
  const [tier, setTier] = useState<ExtracurricularTier>(3);

  const add = () => {
    onChange([...value, { category, detail: detail.trim(), tier }]);
    setDetail("");
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Activity category"
        >
          {EXTRACURRICULAR_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Quick detail, e.g. “Captain, Varsity Soccer” (optional)"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Which tier best fits it?
        </p>
        {([1, 2, 3, 4] as const).map((t) => {
          const active = tier === t;
          const meta = TIER_DESCRIPTIONS[t];
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                "w-full rounded-card border px-3.5 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                active
                  ? "border-yieldly-blue bg-yieldly-blue/8 shadow-card"
                  : "border-hairline bg-surface-card hover:border-yieldly-blue/40"
              )}
            >
              <p
                className={cn(
                  "font-heading text-xs font-bold",
                  active ? "text-yieldly-blue" : "text-navy"
                )}
              >
                {meta.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {meta.description}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {meta.examples}
              </p>
            </button>
          );
        })}
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={add}>
        <Plus className="size-4" />
        Add activity
      </Button>

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((ec, i) => (
            <li
              key={`${ec.category}-${i}`}
              className="flex items-center justify-between gap-2 rounded-card border border-hairline bg-surface-card px-3.5 py-2.5 shadow-card"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">
                  {ec.category}
                  {ec.detail ? ` — ${ec.detail}` : ""}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {TIER_DESCRIPTIONS[ec.tier].label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${ec.category}`}
                className="grid size-7 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-yieldly-coral/10 hover:text-yieldly-coralText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
