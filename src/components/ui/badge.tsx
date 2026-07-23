import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge variants map to the risk-tier semantics in the design system:
 * coral = reach/high risk, blue = target, lime = safety/positive.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-xs font-heading font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-yieldly-blue text-white",
        neutral: "border-hairline bg-secondary text-muted-foreground",
        reach: "border-transparent bg-yieldly-coral/15 text-yieldly-coralText",
        target: "border-transparent bg-yieldly-blue/12 text-yieldly-blue",
        safety: "border-transparent bg-yieldly-lime/25 text-[#3E6B00]",
        outline: "border-hairline text-navy",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
