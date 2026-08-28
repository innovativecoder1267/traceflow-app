"use client";

import type { MockResponse } from "./types";
import { ResponseHeaders } from "./ResponseHeaders";

interface ResponseViewerProps {
  response: MockResponse | null;
  loading: boolean;
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  if (loading) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <p className="text-sm text-[var(--color-muted-foreground)]">Sending request…</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)]">
        <p className="text-sm text-[var(--color-muted-foreground)]">No request sent yet.</p>
      </div>
    );
  }

  const success = response.status >= 200 && response.status < 300;

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--color-border)] px-4 py-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Status
          </p>
          <p
            className={
              success
                ? "text-sm font-medium text-[var(--color-success)]"
                : "text-sm font-medium text-[var(--color-destructive)]"
            }
          >
            {response.status} {response.statusText}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Response Time
          </p>
          <p className="text-sm text-[var(--color-foreground)]">{response.timeMs} ms</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Response Size
          </p>
          <p className="text-sm text-[var(--color-foreground)]">{response.sizeLabel}</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <ResponseHeaders headers={response.headers} />
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-foreground)]">Response Body</p>
          <pre className="overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-xs leading-relaxed text-[var(--color-foreground)]">
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
