"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import {
  rankScholarships,
  scoreScholarship,
  type ScholarshipSort,
} from "@/lib/scholarships";
import { SCHOLARSHIPS } from "@/lib/scholarships-data";
import { getProfile } from "@/lib/storage";
import { EMPTY_PROFILE, type StudentProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ScholarshipSort; label: string }[] = [
  { value: "yield", label: "Yield" },
  { value: "amount", label: "Amount" },
  { value: "deadline", label: "Deadline" },
];

/**
 * Scholarship Yield Finder (docs/FEATURES.md §3). Ranks a curated set of real
 * scholarships by expected value (win odds × payout) so the highest-yield
 * opportunities — not just the biggest headline numbers — rise to the top.
 */
export function ScholarshipsExperience() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [sort, setSort] = useState<ScholarshipSort>("yield");
  const [matchesOnly, setMatchesOnly] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setMounted(true);
  }, []);

  const scored = useMemo(
    () => SCHOLARSHIPS.map((s) => scoreScholarship(s, profile)),
    [profile]
  );
  const ranked = useMemo(
    () => rankScholarships(scored, sort, matchesOnly),
    [scored, sort, matchesOnly]
  );

  const matchCount = scored.filter((s) => s.matchesProfile).length;
  const hasMajor =
    profile.completedOnboarding && !!profile.majorInterest && profile.majorInterest !== "Undecided";

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-3">
        <h1 className="text-2xl font-extrabold text-navy">Scholarships</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Ranked by yield — win odds × payout, not just the biggest number.
        </p>
      </div>

      {/* Concept hero */}
      <div className="mb-4 flex items-start gap-3 rounded-card bg-brand-gradient p-4 text-white shadow-card">
        <TrendingUp className="mt-0.5 size-5 shrink-0" />
        <p className="text-sm leading-snug">
          A $50k lottery you&apos;ll never win is worth less than a $2k award that
          fits you. Yieldly ranks by <span className="font-bold">expected value</span>{" "}
          so you spend effort where it pays off.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex rounded-pill bg-secondary p-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                "relative rounded-pill px-3 py-1.5 font-heading text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                sort === opt.value ? "text-navy" : "text-muted-foreground"
              )}
            >
              {sort === opt.value && (
                <motion.span
                  layoutId="sort-pill"
                  className="absolute inset-0 rounded-pill bg-surface-card shadow-card"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          ))}
        </div>

        {hasMajor && (
          <button
            onClick={() => setMatchesOnly((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-pill border px-3 py-2 font-heading text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              matchesOnly
                ? "border-transparent bg-yieldly-blue text-white shadow-card"
                : "border-hairline bg-surface-card text-navy"
            )}
          >
            <Sparkles className="size-3.5" />
            Fits my major
            {matchCount > 0 && !matchesOnly && (
              <span className="tabular text-muted-foreground">{matchCount}</span>
            )}
          </button>
        )}
      </div>

      {/* Ranked list */}
      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {ranked.map((s, i) => (
            <ScholarshipCard key={s.scholarship.id} scored={s} rank={i + 1} />
          ))}

          <p className="px-1 pt-1 text-[11px] leading-snug text-muted-foreground">
            A curated starting set of {SCHOLARSHIPS.length} real scholarships — not
            exhaustive. Amounts, deadlines, and odds are approximate and change
            yearly; win-likelihood is a Yieldly estimate, not a published rate.
            Always confirm details on the provider&apos;s site.
          </p>
        </motion.div>
      )}
    </div>
  );
}
