"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Right-swipe celebration: a brand-gradient burst with radiating particles in
 * the Yieldly palette (docs/FEATURES.md §1 calls this out as a key
 * "doesn't look cheap" moment). Rendered by the deck inside an AnimatePresence
 * with a changing key so it replays on every match. Non-interactive overlay.
 */

const PARTICLE_COLORS = ["#3B6BFF", "#FF6B6B", "#C6FF6B", "#1533A6", "#3B6BFF", "#FF6B6B"];
const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  distance: 110 + (i % 4) * 26,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  size: 8 + (i % 3) * 4,
  delay: (i % 5) * 0.02,
}));

export function MatchBurst({ schoolName }: { schoolName: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      {/* Expanding gradient ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0.55 }}
        animate={{ scale: 3.4, opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute size-32 rounded-full bg-brand-gradient"
      />

      {/* Radiating particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            scale: [0, 1, 0.6],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: p.delay }}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
        />
      ))}

      {/* Center check + label */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-2"
      >
        <div className="grid size-16 place-items-center rounded-full bg-brand-gradient shadow-pop">
          <Check className="size-8 text-white" strokeWidth={3} />
        </div>
        <div className="rounded-pill bg-navy/90 px-3 py-1 backdrop-blur">
          <span className="font-heading text-xs font-bold text-white">
            Added to portfolio
          </span>
        </div>
      </motion.div>

      {/* Screen-reader announcement */}
      <span className="sr-only" role="status">
        {schoolName} added to your portfolio
      </span>
    </div>
  );
}
