import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Yieldly brand marks. Uses the approved final logo assets in /public
 * (cropped from assets/Yieldly_Logo_Full_Final.png). The earlier SVG concepts
 * are reference-only per docs/DESIGN_SYSTEM.md and are intentionally not used.
 */

export function LogoFull({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/yieldly-logo-full.png"
      alt="Yieldly"
      width={1774}
      height={887}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

export function LogoIcon({
  className,
  size = 40,
  priority,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/yieldly-icon.png"
      alt="Yieldly"
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-[22%]", className)}
    />
  );
}

/** Clickable header lockup: icon + wordmark, links home. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/discover"
      aria-label="Yieldly home"
      className={cn(
        "inline-flex items-center gap-2 rounded-pill transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className
      )}
    >
      <LogoIcon size={32} priority />
      <span className="font-heading text-xl font-extrabold lowercase tracking-tight text-navy">
        yieldly
      </span>
    </Link>
  );
}
