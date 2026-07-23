import { cn } from "@/lib/utils";

/**
 * Designed placeholder graphic for a school card (no external photos — keeps the
 * app fast, offline-friendly, and strictly on-palette). A deterministic
 * navy→blue gradient (angle varies by id, hue stays in-brand), a faint dot grid,
 * a coral accent, and the school's monogram. Doubles as a real-photo slot later.
 */

function initials(name: string): string {
  const stop = new Set(["of", "the", "at", "and", "&", "college", "university"]);
  const words = name
    .replace(/[.,]/g, "")
    .split(/\s+/)
    .filter((w) => !stop.has(w.toLowerCase()));
  const letters = (words.length ? words : name.split(/\s+/))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || name.slice(0, 2).toUpperCase();
}

export function SchoolArt({
  name,
  seed,
  imageUrl,
  className,
}: {
  name: string;
  seed: number;
  /** When present, a real campus photo replaces the gradient (Phase 5 polish). */
  imageUrl?: string | null;
  className?: string;
}) {
  // Vary the gradient angle deterministically; keep both stops in the brand blue→navy range.
  const angle = 110 + (seed % 7) * 20;
  const gradient = `linear-gradient(${angle}deg, #3B6BFF 0%, #1E3A8C 55%, #0B1F4D 100%)`;

  // Real photo path: cover image with a navy scrim so the overlaid risk badge
  // stays legible. Falls back to the designed gradient monogram when absent.
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden", className)} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />
        <div className="absolute right-5 top-5 size-3 rounded-full bg-yieldly-coral shadow-pop" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: gradient }}
      aria-hidden
    >
      {/* Faint dot grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(#FFFFFF 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Soft light bloom */}
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
      {/* Coral accent dot — the brand "pop" */}
      <div className="absolute right-5 top-5 size-3 rounded-full bg-yieldly-coral shadow-pop" />
      {/* Monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-6xl font-extrabold tracking-tight text-white/95 drop-shadow-sm">
          {initials(name)}
        </span>
      </div>
    </div>
  );
}
