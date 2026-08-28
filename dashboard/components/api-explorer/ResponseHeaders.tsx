"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Response Headers
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] px-3 py-2 space-y-1">
          {Object.entries(headers).map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-[140px_1fr] gap-2 text-[11px] font-mono"
            >
              <span className="text-[var(--color-muted-foreground)]">{key}</span>
              <span className="text-[var(--color-foreground)] break-all">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
