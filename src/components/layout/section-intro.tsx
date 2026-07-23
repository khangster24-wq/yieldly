import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** A section's title block: big heading + one-line blurb in brand voice. */
export function SectionIntro({
  title,
  blurb,
  className,
}: {
  title: string;
  blurb: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 animate-fade-up", className)}>
      <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
    </div>
  );
}

/**
 * Designed placeholder for pillars not yet built (Phase 0 shell). Deliberately
 * not a gray box: brand-tinted icon, a "coming next" phase note, and a preview of
 * what will live here — so even the scaffold reads as premium.
 */
export function ComingSoon({
  icon: Icon,
  phase,
  headline,
  points,
}: {
  icon: LucideIcon;
  phase: string;
  headline: string;
  points: string[];
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-card border border-dashed border-hairline bg-surface-card/60 px-6 py-12 text-center shadow-card animate-scale-in">
      <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
        <Icon className="size-7 text-white" strokeWidth={2.2} />
      </div>
      <span className="mb-2 inline-flex items-center rounded-pill bg-yieldly-blue/10 px-3 py-1 font-heading text-xs font-semibold text-yieldly-blue">
        {phase}
      </span>
      <h2 className="text-lg font-bold text-navy">{headline}</h2>
      <ul className="mt-4 space-y-2 text-left">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <span className="mt-1 size-1.5 shrink-0 rounded-pill bg-yieldly-coral" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
