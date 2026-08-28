import { GitBranch } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import Link from "next/link";

export default function TracesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Traces
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Incoming traces from your applications
        </p>
      </div>
      <EmptyState
        icon={<GitBranch className="h-5 w-5" />}
        heading="No traces captured yet"
        description="Install the TraceFlow SDK in your application to start capturing traces."
        action={
          <Link
            href="/dashboard/settings"
            className="text-xs text-[var(--color-foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            View SDK setup →
          </Link>
        }
      />
    </div>
  );
}
