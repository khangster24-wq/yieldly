"use client";

import { motion } from "framer-motion";

/** Subtle fade-up on route content so section changes feel intentional, not instant. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full min-h-0 max-w-md flex-1 flex-col overflow-y-auto px-4 pb-6 pt-5"
    >
      {children}
    </motion.div>
  );
}
