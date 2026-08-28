import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  description: string;
  action: ReactNode;
}

export function EmptyState({
  icon,
  heading,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 rounded-lg border border-dashed border-[var(--color-border)]">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          {heading}
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
