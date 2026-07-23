"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";

import { CollegeCard } from "@/components/discover/college-card";
import type { ScoredCollege } from "@/lib/types";

export type SwipeDirection = "left" | "right";

export interface SwipeCardHandle {
  /** Programmatically fling the card (used by the pass/like buttons + keyboard). */
  swipe: (dir: SwipeDirection) => void;
}

// A fling commits if the drag passes this far OR is thrown this fast.
const DISTANCE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 480;

/**
 * A single draggable discovery card with real physics (docs/FEATURES.md §1):
 * the card follows the pointer, rotates with drag distance, flings off-screen
 * past a distance/velocity threshold, and springs back if released short.
 * Owns its own motion value so each card's exit is independent (no shared-state
 * flashes as the next card promotes).
 */
export const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    scored: ScoredCollege;
    onSwiped: (dir: SwipeDirection) => void;
  }
>(function SwipeCard({ scored, onSwiped }, ref) {
  const x = useMotionValue(0);
  // Rotate up to ±16° as the card is dragged — the signature "throw" feel.
  const rotate = useTransform(x, [-320, 0, 320], [-16, 0, 16]);
  // Reveal the LIKE / NOPE stamps proportionally to drag distance.
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0]);

  const flinging = useRef(false);

  const flyOut = (dir: SwipeDirection) => {
    if (flinging.current) return;
    flinging.current = true;
    const width = typeof window !== "undefined" ? window.innerWidth : 500;
    const target = (dir === "right" ? 1 : -1) * (width * 1.25 + 200);
    animate(x, target, {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => onSwiped(dir),
    });
  };

  useImperativeHandle(ref, () => ({ swipe: flyOut }), []);

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > DISTANCE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      flyOut("right");
    } else if (offset.x < -DISTANCE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      flyOut("left");
    } else {
      // Released short — spring back to center.
      animate(x, 0, { type: "spring", stiffness: 340, damping: 30 });
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ x, rotate, zIndex: 20 }}
      drag="x"
      dragElastic={0.55}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.99 }}
    >
      {/* LIKE stamp */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-6 z-10 -rotate-12 rounded-xl border-4 border-yieldly-lime px-3 py-1"
      >
        <span className="font-heading text-2xl font-extrabold uppercase tracking-wider text-[#3E6B00]">
          Save
        </span>
      </motion.div>
      {/* NOPE stamp */}
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-5 top-6 z-10 rotate-12 rounded-xl border-4 border-yieldly-coral px-3 py-1"
      >
        <span className="font-heading text-2xl font-extrabold uppercase tracking-wider text-yieldly-coralText">
          Pass
        </span>
      </motion.div>

      <CollegeCard scored={scored} />
    </motion.div>
  );
});
