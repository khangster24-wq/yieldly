"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DiversificationMeter } from "@/components/portfolio/diversification-meter";
import { StatTiles } from "@/components/portfolio/stat-tiles";
import { RiskReturnScatter } from "@/components/portfolio/risk-return-scatter";
import { TierSections } from "@/components/portfolio/tier-sections";
import { SuggestedSchools } from "@/components/portfolio/suggested-schools";
import { scoreCollege } from "@/lib/scoring";
import { summarizePortfolio } from "@/lib/portfolio";
import { addToPortfolio, getPortfolio, getProfile, removeFromPortfolio } from "@/lib/storage";
import { EMPTY_PROFILE, type College, type StudentProfile } from "@/lib/types";

/**
 * Portfolio dashboard (docs/FEATURES.md §2). Reads the saved schools + profile
 * from storage, scores them through the risk/return engine, and renders the
 * diversification meter, aggregate stats, risk/return map, and tiered list —
 * the whole thing framed as an investment portfolio.
 */
export function PortfolioExperience() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState<College[]>([]);

  useEffect(() => {
    setProfile(getProfile());
    setSaved(getPortfolio());
    setMounted(true);
  }, []);

  const scored = useMemo(
    () => saved.map((c) => scoreCollege(c, profile)),
    [saved, profile]
  );
  const summary = useMemo(() => summarizePortfolio(scored), [scored]);

  const handleRemove = (id: number) => setSaved(removeFromPortfolio(id));
  const handleAdd = (college: College) => setSaved(addToPortfolio(college));

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-navy">Portfolio</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your college list as a risk / return portfolio.
        </p>
      </div>

      {/* Body only renders after mount (reads localStorage) — avoids hydration mismatch. */}
      {mounted &&
        (saved.length === 0 ? (
          <div className="flex flex-1 flex-col gap-4">
            <SuggestedSchools saved={saved} profile={profile} onAdd={handleAdd} />
            <EmptyPortfolio />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <DiversificationMeter summary={summary} />
            <SuggestedSchools saved={saved} profile={profile} onAdd={handleAdd} />
            <StatTiles summary={summary} />
            <RiskReturnScatter buckets={summary.buckets} />
            <TierSections buckets={summary.buckets} onRemove={handleRemove} />

            <p className="px-1 pt-1 text-[11px] leading-snug text-muted-foreground">
              Risk tiers and ROI are Yieldly estimates from real{" "}
              {scored.some((s) => s.college.country)
                ? "government and university-published"
                : "College Scorecard"}{" "}
              data — helpful for comparison, not admission guarantees.
            </p>
          </motion.div>
        ))}
    </div>
  );
}

function EmptyPortfolio() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-surface-card/60 px-8 py-14 text-center shadow-card"
    >
      <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
        <PieChart className="size-7 text-white" strokeWidth={2.2} />
      </div>
      <h2 className="text-lg font-bold text-navy">Your portfolio is empty</h2>
      <p className="mt-1 max-w-[17rem] text-sm text-muted-foreground">
        Swipe right on schools in Discover to start building a balanced list —
        then come back to see your diversification and yield.
      </p>
      <Button variant="gradient" className="mt-5" asChild>
        <Link href="/discover">
          <LayoutGrid className="size-4" />
          Start swiping
        </Link>
      </Button>
    </motion.div>
  );
}
