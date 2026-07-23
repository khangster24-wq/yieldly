"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { REGIONS } from "@/lib/regions";
import {
  EMPTY_FILTERS,
  type ControlFilter,
  type DeckFilters,
  type SizeTier,
} from "@/lib/types";
import { cn, formatUSD } from "@/lib/utils";

const SIZES: { value: SizeTier; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Mid-size" },
  { value: "large", label: "Large" },
];

const CONTROLS: { value: ControlFilter; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const PRICE_MAX = 90_000;

/** Count of non-default filters, for the trigger button's badge. */
export function activeFilterCount(f: DeckFilters): number {
  return (
    (f.maxNetPrice != null ? 1 : 0) +
    (f.regions.length ? 1 : 0) +
    (f.sizes.length ? 1 : 0) +
    (f.controls.length ? 1 : 0)
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 font-heading text-sm font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        active
          ? "border-transparent bg-yieldly-blue text-white shadow-card"
          : "border-hairline bg-surface-card text-navy hover:border-yieldly-blue/40"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Pre-swipe deck filters (docs/FEATURES.md §1): cost ceiling, region, size,
 * public/private. Presented as a bottom sheet so the deck stays in view. Edits
 * apply to a local draft and only commit on "Show schools".
 */
export function DeckFiltersSheet({
  filters,
  countFor,
  onApply,
}: {
  filters: DeckFilters;
  /** Live count of schools that match a given filter draft. */
  countFor: (f: DeckFilters) => number;
  onApply: (next: DeckFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DeckFilters>(filters);
  const count = activeFilterCount(filters);

  const openSheet = () => {
    setDraft(filters); // sync draft to committed state each open
    setOpen(true);
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <>
      <Button variant="outline" size="sm" onClick={openSheet} className="gap-1.5">
        <SlidersHorizontal className="size-4" />
        Filters
        {count > 0 && (
          <span className="ml-0.5 grid size-5 place-items-center rounded-pill bg-yieldly-blue text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[28px] border border-hairline bg-surface-card p-5 shadow-card-hover"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-pill bg-hairline" />

              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-heading text-lg font-extrabold text-navy">
                  Filter your deck
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="grid size-8 place-items-center rounded-pill text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Cost ceiling */}
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-heading text-sm font-semibold text-navy">
                      Max net price / yr
                    </span>
                    <span className="tabular font-heading text-sm font-bold text-yieldly-blue">
                      {draft.maxNetPrice == null || draft.maxNetPrice >= PRICE_MAX
                        ? "No limit"
                        : formatUSD(draft.maxNetPrice)}
                    </span>
                  </div>
                  <Slider
                    value={[draft.maxNetPrice ?? PRICE_MAX]}
                    min={0}
                    max={PRICE_MAX}
                    step={2500}
                    onValueChange={([v]) =>
                      setDraft((d) => ({
                        ...d,
                        maxNetPrice: v >= PRICE_MAX ? null : v,
                      }))
                    }
                  />
                </div>

                {/* Region */}
                <div>
                  <span className="mb-2 block font-heading text-sm font-semibold text-navy">
                    Region
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((r) => (
                      <Chip
                        key={r}
                        active={draft.regions.includes(r)}
                        onClick={() =>
                          setDraft((d) => ({ ...d, regions: toggle(d.regions, r) }))
                        }
                      >
                        {r}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* Size + control */}
                <div className="flex gap-8">
                  <div>
                    <span className="mb-2 block font-heading text-sm font-semibold text-navy">
                      Size
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <Chip
                          key={s.value}
                          active={draft.sizes.includes(s.value)}
                          onClick={() =>
                            setDraft((d) => ({ ...d, sizes: toggle(d.sizes, s.value) }))
                          }
                        >
                          {s.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="mb-2 block font-heading text-sm font-semibold text-navy">
                      Type
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CONTROLS.map((c) => (
                        <Chip
                          key={c.value}
                          active={draft.controls.includes(c.value)}
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              controls: toggle(d.controls, c.value),
                            }))
                          }
                        >
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setDraft(EMPTY_FILTERS)}
                  className="text-muted-foreground"
                >
                  Reset
                </Button>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => {
                    onApply(draft);
                    setOpen(false);
                  }}
                >
                  {(() => {
                    const n = countFor(draft);
                    return `Show ${n} school${n === 1 ? "" : "s"}`;
                  })()}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
