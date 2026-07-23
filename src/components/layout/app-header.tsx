"use client";

import { usePathname } from "next/navigation";

import { LogoLockup } from "@/components/brand/logo";
import { NAV_SECTIONS } from "@/lib/nav";

/** Sticky top header: brand lockup on the left, current section label on the right. */
export function AppHeader() {
  const pathname = usePathname();
  const current = NAV_SECTIONS.find(
    (s) => pathname === s.href || pathname.startsWith(`${s.href}/`)
  );

  return (
    <header className="z-10 shrink-0 border-b border-hairline bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <LogoLockup />
        {current && (
          <span className="font-heading text-sm font-semibold text-muted-foreground">
            {current.label}
          </span>
        )}
      </div>
    </header>
  );
}
