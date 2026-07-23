"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Global error boundary — Next.js requires this to be a Client Component.
 * Keeps the brand voice even when something breaks, instead of a raw stack
 * trace or the framework's default error screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-6">
      <div className="flex w-full max-w-sm flex-col items-center rounded-card border border-hairline bg-surface-card px-8 py-14 text-center shadow-card">
        <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
          <TriangleAlert className="size-7 text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-lg font-bold text-navy">Something went sideways</h1>
        <p className="mt-1 max-w-[17rem] text-sm text-muted-foreground">
          That&apos;s on us, not your portfolio. Give it another try.
        </p>
        <Button variant="gradient" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
