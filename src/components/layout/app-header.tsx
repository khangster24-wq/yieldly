"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { LogoLockup } from "@/components/brand/logo";
import { NAV_SECTIONS } from "@/lib/nav";

/** Sticky top header: brand lockup on the left, current section + settings on the right. */
export function AppHeader() {
  const pathname = usePathname();
  const current = NAV_SECTIONS.find(
    (s) => pathname === s.href || pathname.startsWith(`${s.href}/`)
  );

  return (
    <header className="z-10 shrink-0 border-b border-hairline bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <LogoLockup />
        <div className="flex items-center gap-3">
          {current && (
            <span className="font-heading text-sm font-semibold text-muted-foreground">
              {current.label}
            </span>
          )}
          <Link
            href="/settings"
            aria-label="Edit your profile — stats, budget, major"
            className="grid size-8 shrink-0 place-items-center rounded-pill text-muted-foreground transition-colors hover:bg-secondary hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Settings className="size-[18px]" strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
