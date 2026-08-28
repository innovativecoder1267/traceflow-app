import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: "ACTIVE" | "REVOKED";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "ACTIVE"
          ? "border-[var(--color-success)]/20 bg-[var(--color-success)]/10 text-[var(--color-success)]"
          : "border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "ACTIVE"
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-destructive)]"
        )}
      />
      {status}
    </span>
  );
}
