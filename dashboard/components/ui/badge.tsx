import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
        secondary:
          "border-transparent bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
        destructive:
          "border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]",
        success:
          "border-[var(--color-success)]/20 bg-[var(--color-success)]/10 text-[var(--color-success)]",
        outline: "border-[var(--color-border)] text-[var(--color-foreground)]",
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
