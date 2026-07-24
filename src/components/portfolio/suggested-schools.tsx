"use client";

import { useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";

import { SchoolArt } from "@/components/discover/school-art";
import { TIER_META } from "@/lib/tiers";
import { suggestSchools } from "@/lib/suggestions";
import type { College, StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * "Suggested for you" — a horizontal strip of schools ranked by
 * src/lib/suggestions.ts, shown on Portfolio (both empty and populated
 * states). Reuses the same real risk/ROI scores as everywhere else; the
 * `reason` line is the one new, explainable piece of copy per suggestion.
 */
export function SuggestedSchools({
  saved,
  profile,
  onAdd,
}: {
  saved: College[];
  profile: StudentProfile;
  onAdd: (college: College) => void;
}) {
  const suggestions = useMemo(() => suggestSchools(saved, profile, 5), [saved, profile]);

  if (suggestions.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <Sparkles className="size-4 text-yieldly-blue" />
        <h2 className="font-heading text-sm font-bold text-navy">Suggested for you</h2>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {suggestions.map(({ scored, reason }) => {
          const meta = TIER_META[scored.risk.tier];
          return (
            <div
              key={scored.college.id}
              className="w-[210px] shrink-0 overflow-hidden rounded-card border border-hairline bg-surface-card shadow-card"
            >
              <div className="relative h-24">
                <SchoolArt
                  name={scored.college.name}
                  seed={scored.college.id}
                  imageUrl={scored.college.imageUrl}
                  className="h-full w-full"
                />
                <button
                  onClick={() => onAdd(scored.college)}
                  aria-label={`Add ${scored.college.name} to portfolio`}
                  className="absolute right-2 top-2 grid size-8 place-items-center rounded-pill bg-white/95 text-yieldly-blue shadow-card backdrop-blur transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate font-heading text-sm font-bold text-navy">
                  {scored.college.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs">
                  <span className={cn("size-1.5 shrink-0 rounded-pill", meta.dot)} />
                  <span className={cn("shrink-0 font-semibold", meta.text)}>{meta.label}</span>
                  <span className="truncate text-muted-foreground">· {scored.roi.label}</span>
                </p>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
