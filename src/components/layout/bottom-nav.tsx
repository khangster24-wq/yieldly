"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Primary navigation. Mobile-first: a fixed bottom tab bar (thumb-reachable),
 * which on wider screens sits centered under the app column. The active tab
 * gets a shared-layout pill highlight that slides between tabs via framer-motion.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="z-10 shrink-0 border-t border-hairline bg-surface-card/85 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {NAV_SECTIONS.map((section) => {
          const active =
            pathname === section.href || pathname.startsWith(`${section.href}/`);
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-pill px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-x-2 inset-y-0 rounded-pill bg-yieldly-blue/10"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 size-5 transition-colors",
                  active ? "text-yieldly-blue" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  "relative z-10 font-heading text-[11px] font-semibold transition-colors",
                  active ? "text-yieldly-blue" : "text-muted-foreground"
                )}
              >
                {section.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
