"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X, Heart } from "lucide-react";

import {
  SwipeCard,
  type SwipeCardHandle,
  type SwipeDirection,
} from "@/components/discover/swipe-card";
import { CollegeCard } from "@/components/discover/college-card";
import { MatchBurst } from "@/components/discover/match-burst";
import type { ScoredCollege } from "@/lib/types";
import { cn } from "@/lib/utils";

/** How many cards are visible in the stack at once. */
const VISIBLE = 3;

interface SwipeRecord {
  scored: ScoredCollege;
  dir: SwipeDirection;
}

/**
 * The discovery card stack. Renders up to three cards deep (top one draggable),
 * wires the pass/undo/save buttons and keyboard arrows to the same physics, and
 * fires callbacks so the parent can persist matches. When the deck empties it
 * renders the provided empty state.
 */
export function CardStack({
  deck,
  onMatch,
  onPass,
  onUndo,
  emptyState,
}: {
  deck: ScoredCollege[];
  onMatch: (scored: ScoredCollege) => void;
  onPass?: (scored: ScoredCollege) => void;
  /** Called when a match is undone, so the parent can un-persist it. */
  onUndo?: (scored: ScoredCollege) => void;
  emptyState: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<SwipeRecord[]>([]);
  const [burst, setBurst] = useState<{ key: number; name: string } | null>(null);
  const topRef = useRef<SwipeCardHandle>(null);

  const handleSwiped = useCallback(
    (scored: ScoredCollege, dir: SwipeDirection) => {
      setHistory((h) => [...h, { scored, dir }]);
      setIndex((i) => i + 1);
      if (dir === "right") {
        onMatch(scored);
        setBurst({ key: Date.now(), name: scored.college.name });
      } else {
        onPass?.(scored);
      }
    },
    [onMatch, onPass]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    // Pure state updates + a side-effect callback, all inside this event
    // handler — never inside a setState updater (which React may run mid-render).
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
    if (last.dir === "right") onUndo?.(last.scored);
  }, [history, onUndo]);

  // Clear the celebration a beat after it plays.
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(null), 850);
    return () => clearTimeout(t);
  }, [burst]);

  // Keyboard: ← pass, → save, Backspace undo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") topRef.current?.swipe("left");
      else if (e.key === "ArrowRight") topRef.current?.swipe("right");
      else if (e.key === "Backspace") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo]);

  const done = index >= deck.length;
  const visible = deck.slice(index, index + VISIBLE);

  return (
    <div className="flex flex-1 flex-col">
      {/* Stack area */}
      <div className="relative flex-1">
        <AnimatePresence>
          {burst && <MatchBurst key={burst.key} schoolName={burst.name} />}
        </AnimatePresence>

        {done ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {emptyState}
          </div>
        ) : (
          visible
            .map((scored, p) => {
              const isTop = p === 0;
              if (isTop) {
                return (
                  <SwipeCard
                    key={scored.college.id}
                    ref={topRef}
                    scored={scored}
                    onSwiped={(dir) => handleSwiped(scored, dir)}
                  />
                );
              }
              // Background cards: scaled + nudged down, non-interactive.
              return (
                <motion.div
                  key={scored.college.id}
                  className="pointer-events-none absolute inset-0"
                  initial={false}
                  animate={{ scale: 1 - p * 0.05, y: p * 16 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ zIndex: VISIBLE - p }}
                >
                  <CollegeCard scored={scored} />
                </motion.div>
              );
            })
            // Paint top card last so it sits above the stack.
            .reverse()
        )}
      </div>

      {/* Action buttons — a designed fallback to dragging (also keyboard-accessible). */}
      {!done && (
        <div className="mt-6 flex items-center justify-center gap-5">
          <ActionButton
            label="Pass"
            onClick={() => topRef.current?.swipe("left")}
            className="border-yieldly-coral/30 text-yieldly-coralText hover:bg-yieldly-coral/10"
          >
            <X className="size-7" strokeWidth={2.5} />
          </ActionButton>

          <ActionButton
            label="Undo last swipe"
            onClick={undo}
            disabled={history.length === 0}
            size="sm"
            className="border-hairline text-muted-foreground hover:bg-secondary"
          >
            <RotateCcw className="size-5" strokeWidth={2.5} />
          </ActionButton>

          <ActionButton
            label="Save to portfolio"
            onClick={() => topRef.current?.swipe("right")}
            className="border-transparent bg-brand-gradient text-white shadow-card hover:shadow-card-hover"
          >
            <Heart className="size-7 fill-white" strokeWidth={2.5} />
          </ActionButton>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
  size = "lg",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: "lg" | "sm";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid place-items-center rounded-pill border-2 bg-surface-card transition-all active:scale-90 disabled:opacity-40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        size === "lg" ? "size-16" : "size-12",
        className
      )}
    >
      {children}
    </button>
  );
}
