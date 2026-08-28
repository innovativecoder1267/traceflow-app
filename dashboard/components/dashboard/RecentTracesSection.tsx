import Link from "next/link";
import { GitBranch } from "lucide-react";
import { EmptyState } from "./EmptyState";
import type { Trace } from "@/types/trace";

interface RecentTracesSectionProps {
  traces: Trace[];
  error?: boolean;
}

export function RecentTracesSection({ traces, error }: RecentTracesSectionProps) {
  const sorted = [...traces]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-4 py-8 text-center">
        <p className="text-sm text-[var(--color-destructive)]">
          Failed to load recent traces
        </p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch className="h-5 w-5" />}
        heading="No traces yet"
        description="Install the TraceFlow SDK to start capturing traces from your application."
        action={
          <Link
            href="/dashboard/settings"
            className="text-xs text-[var(--color-foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            View SDK setup →
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((trace) => (
        <div
          key={trace._id}
          className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-ring)]/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-mono font-medium text-[var(--color-muted-foreground)] shrink-0">
              {trace.method}
            </span>
            <span className="text-sm text-[var(--color-foreground)] truncate">
              {trace.route}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {trace.duration}ms
            </span>
            <span
              className={`text-xs font-medium ${
                trace.status === "SUCCESS"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-destructive)]"
              }`}
            >
              {trace.statusCode}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
