import Link from "next/link";
import { Compass, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Branded 404 — matches the empty-state visual language used across the app. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface p-6">
      <div className="flex w-full max-w-sm flex-col items-center rounded-card border border-hairline bg-surface-card px-8 py-14 text-center shadow-card">
        <div className="mb-4 grid size-16 place-items-center rounded-card bg-brand-gradient shadow-card">
          <Compass className="size-7 text-white" strokeWidth={2.2} />
        </div>
        <h1 className="text-lg font-bold text-navy">Nothing here</h1>
        <p className="mt-1 max-w-[17rem] text-sm text-muted-foreground">
          This page doesn&apos;t exist — but your college list still does.
        </p>
        <Button variant="gradient" className="mt-5" asChild>
          <Link href="/discover">
            <LayoutGrid className="size-4" />
            Back to Yieldly
          </Link>
        </Button>
      </div>
    </div>
  );
}
