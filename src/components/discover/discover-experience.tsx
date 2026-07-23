"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, LayoutGrid, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardStack } from "@/components/discover/card-stack";
import { DeckFiltersSheet } from "@/components/discover/deck-filters";
import { buildDeck } from "@/lib/deck";
import {
  addToPortfolio,
  getPortfolio,
  getProfile,
  removeFromPortfolio,
} from "@/lib/storage";
import { getDatasetMeta } from "@/lib/colleges";
import {
  EMPTY_FILTERS,
  EMPTY_PROFILE,
  type DeckFilters,
  type ScoredCollege,
  type StudentProfile,
} from "@/lib/types";

/**
 * The Discover screen: builds a personalized, filtered deck from the student's
 * onboarding profile and drives the swipe stack. Right swipes persist to the
 * portfolio (localStorage) so Phase 2's dashboard has data to read.
 */
export function DiscoverExperience() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [filters, setFilters] = useState<DeckFilters>(EMPTY_FILTERS);
  // Bumped whenever filters are applied, to remount (reset) the card stack.
  const [deckVersion, setDeckVersion] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  // Load profile + seed the filters from onboarding once, on the client.
  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setFilters({
      ...EMPTY_FILTERS,
      maxNetPrice: p.budgetCeiling ?? null,
      regions: p.regions ?? [],
    });
    setSavedCount(getPortfolio().length);
    setMounted(true);
  }, []);

  const deck = useMemo(
    () => (mounted ? buildDeck(profile, filters) : []),
    [mounted, profile, filters]
  );

  const countFor = useCallback(
    (f: DeckFilters) => buildDeck(profile, f).length,
    [profile]
  );

  const applyFilters = (next: DeckFilters) => {
    setFilters(next);
    setDeckVersion((v) => v + 1);
  };

  const handleMatch = useCallback((scored: ScoredCollege) => {
    addToPortfolio(scored.college);
    setSavedCount(getPortfolio().length);
  }, []);

  const handleUndo = useCallback((scored: ScoredCollege) => {
    removeFromPortfolio(scored.college.id);
    setSavedCount(getPortfolio().length);
  }, []);

  const meta = getDatasetMeta();
  const hasActiveFilters =
    filters.maxNetPrice != null ||
    filters.regions.length > 0 ||
    filters.sizes.length > 0 ||
    filters.controls.length > 0;

  return (
    <div className="flex flex-1 flex-col">
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Discover</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Swipe right to add a school to your portfolio.
          </p>
        </div>
        <Link
          href="/portfolio"
          className="flex shrink-0 items-center gap-1.5 rounded-pill bg-secondary px-3 py-2 font-heading text-sm font-bold text-navy transition-colors hover:bg-yieldly-blue/10"
        >
          <Bookmark className="size-4 text-yieldly-blue" />
          {savedCount}
        </Link>
      </div>

      {/* Controls row */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-yieldly-blue" />
          {meta.live ? "Live Scorecard + intl. data" : "Curated real-school set"} ·{" "}
          {deck.length} school{deck.length === 1 ? "" : "s"}
        </span>
        <DeckFiltersSheet
          filters={filters}
          countFor={countFor}
          onApply={applyFilters}
        />
      </div>

      {/* Deck */}
      <div className="relative flex min-h-[460px] flex-1 flex-col">
        {mounted && (
          <CardStack
            key={deckVersion}
            deck={deck}
            onMatch={handleMatch}
            onUndo={handleUndo}
            emptyState={
              <EmptyDeck
                filtered={hasActiveFilters && deck.length === 0}
                savedCount={savedCount}
                onReset={() => applyFilters(EMPTY_FILTERS)}
              />
            }
          />
        )}
      </div>
    </div>
  );
}

/** Designed empty state — filters too tight, or the whole deck swiped through. */
function EmptyDeck({
  filtered,
  savedCount,
  onReset,
}: {
  filtered: boolean;
  savedCount: number;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center rounded-card border border-dashed border-hairline bg-surface-card/60 px-8 py-12 text-center shadow-card"
    >
      <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
        {filtered ? (
          <SlidersHorizontal className="size-7 text-white" strokeWidth={2.2} />
        ) : (
          <LayoutGrid className="size-7 text-white" strokeWidth={2.2} />
        )}
      </div>

      {filtered ? (
        <>
          <h2 className="text-lg font-bold text-navy">No schools match</h2>
          <p className="mt-1 max-w-[16rem] text-sm text-muted-foreground">
            Your filters are a little tight. Loosen them up to see more of the deck.
          </p>
          <Button variant="gradient" className="mt-5" onClick={onReset}>
            Clear filters
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-navy">That&apos;s the whole deck</h2>
          <p className="mt-1 max-w-[16rem] text-sm text-muted-foreground">
            You&apos;ve been through every school.{" "}
            {savedCount > 0
              ? `${savedCount} made your portfolio — go build it out.`
              : "Loosen your filters to see more, or start your portfolio."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {savedCount > 0 && (
              <Button variant="gradient" asChild>
                <Link href="/portfolio">View portfolio</Link>
              </Button>
            )}
            <Button variant="outline" onClick={onReset}>
              Start over
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
