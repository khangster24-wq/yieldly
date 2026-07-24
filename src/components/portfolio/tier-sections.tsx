"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";

import { SchoolArt } from "@/components/discover/school-art";
import { TIER_META, TIER_ORDER } from "@/lib/tiers";
import type { TierBuckets } from "@/lib/portfolio";
import type { ScoredCollege } from "@/lib/types";
import { cn, formatUSD, formatPercent } from "@/lib/utils";

/**
 * Saved schools grouped and color-coded by risk tier (docs/FEATURES.md §2),
 * each row showing the real cost/odds at a glance with a remove control.
 */
export function TierSections({
  buckets,
  onRemove,
}: {
  buckets: TierBuckets;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="space-y-5">
      {TIER_ORDER.map((tier) => {
        const schools = buckets[tier];
        if (schools.length === 0) return null;
        const meta = TIER_META[tier];
        return (
          <section key={tier}>
            <div className="mb-2 flex items-center gap-2">
              <span className={cn("size-2.5 rounded-pill", meta.dot)} />
              <h2 className="font-heading text-sm font-bold text-navy">
                {meta.label}
              </h2>
              <span className="tabular font-heading text-sm font-bold text-muted-foreground">
                {schools.length}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {schools.map((s) => (
                  <SchoolRow key={s.college.id} scored={s} onRemove={onRemove} />
                ))}
              </AnimatePresence>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SchoolRow({
  scored,
  onRemove,
}: {
  scored: ScoredCollege;
  onRemove: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const { college, risk, roi } = scored;
  const meta = TIER_META[risk.tier];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-card border border-hairline bg-surface-card shadow-card"
    >
      <div className="flex items-center gap-2 p-2.5">
        {/* Tapping the row expands the "why" + underlying numbers. */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <SchoolArt
            name={college.name}
            seed={college.id}
            imageUrl={college.imageUrl}
            className="size-12 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-bold text-navy">
              {college.name}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
              <span className={cn("font-heading font-bold", meta.text)}>
                {risk.admitProbability != null
                  ? `~${formatPercent(risk.admitProbability)} admit`
                  : meta.label}
              </span>
              <span aria-hidden>·</span>
              <span className="tabular">{formatUSD(roi.netPrice)}/yr net</span>
              <span aria-hidden>·</span>
              <span>ROI {roi.label}</span>
            </p>
          </div>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        <button
          onClick={() => onRemove(college.id)}
          aria-label={`Remove ${college.name} from portfolio`}
          className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-yieldly-coral/10 hover:text-yieldly-coralText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Expandable detail — the underlying numbers + why, delivering the
          "explainable, never a naked score" promise (docs/FEATURES.md §2). */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-hairline px-3 py-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <DetailStat
                  label="Sticker / yr"
                  value={formatUSD(college.costOfAttendance)}
                  hint={college.costNote ? "see note below" : "before aid"}
                />
                <DetailStat
                  label="Net / yr"
                  value={formatUSD(roi.netPrice)}
                  hint={roi.incomeAdjusted ? "for your income" : "avg after aid"}
                />
                <DetailStat
                  label="Grad earnings"
                  value={formatUSD(roi.medianEarnings)}
                  hint={college.earningsNote ?? "median, 10 yrs out"}
                />
                <DetailStat
                  label="Median debt"
                  value={formatUSD(roi.medianDebt)}
                  hint="at graduation"
                />
              </div>
              <div className="mt-3 space-y-2 border-t border-hairline pt-3">
                <RationaleLine label="Risk" tone={meta.text} text={risk.rationale} />
                <RationaleLine label="ROI" tone={meta.text} text={roi.rationale} />
                {roi.caveat && (
                  <RationaleLine label="Note" tone={meta.text} text={roi.caveat} />
                )}
                {college.costNote && (
                  <RationaleLine label="Note" tone={meta.text} text={college.costNote} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="tabular font-heading text-base font-bold leading-tight text-navy">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function RationaleLine({
  label,
  tone,
  text,
}: {
  label: string;
  tone: string;
  text: string;
}) {
  return (
    <div className="flex gap-2">
      <span
        className={cn(
          "w-8 shrink-0 font-heading text-[10px] font-bold uppercase tracking-wide",
          tone
        )}
      >
        {label}
      </span>
      <p className="text-xs leading-snug text-muted-foreground">{text}</p>
    </div>
  );
}
