import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, icon, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-3 transition-colors hover:border-[var(--color-ring)]/40",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
          {label}
        </p>
        <div className="text-[var(--color-muted-foreground)]">{icon}</div>
      </div>
      <p className="text-2xl font-semibold text-[var(--color-foreground)] tabular-nums">
        {value}
      </p>
    </div>
  );
}
