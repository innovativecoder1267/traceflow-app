"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Trace } from "@/types/trace";

interface TracePlaceholderProps {
  projectId: string;
}

export function TracePlaceholder({ projectId }: TracePlaceholderProps) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTraces() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/traces?projectId=${encodeURIComponent(projectId)}`,
          { credentials: "include", signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load traces");
        }

        const data: { traces?: Trace[] } = await response.json();
        setTraces(data.traces ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load traces");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTraces();
    return () => controller.abort();
  }, [projectId]);

  return (
    <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader>
        <CardTitle className="text-sm">Traces</CardTitle>
        <p className="break-all font-mono text-[10px] text-[var(--color-muted-foreground)]">
          Project ID: {projectId}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Loading traces…
          </p>
        ) : error ? (
          <p className="text-xs text-[var(--color-destructive)]">{error}</p>
        ) : traces.length === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No traces captured for this project yet.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {traces.map((trace) => (
              <div
                key={trace._id}
                className="space-y-1.5 rounded-md border border-[var(--color-border)] px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium text-[var(--color-foreground)]">
                    {trace.method} {trace.route}
                  </span>
                  <span
                    className={
                      trace.statusCode >= 200 && trace.statusCode < 400
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-destructive)]"
                    }
                  >
                    {trace.statusCode} · {trace.statusCode >= 200 && trace.statusCode < 400 ? "Success" : "Failure"}
                  </span>
                </div>
                <p className="text-[var(--color-muted-foreground)]">
                  {trace.duration}ms · {formatStartedAt(trace.startedAt)}
                </p>
                <p className="break-all font-mono text-[10px] text-[var(--color-muted-foreground)]">
                  {trace.traceId}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatStartedAt(startedAt: string): string {
  const date = new Date(startedAt);
  return Number.isNaN(date.getTime()) ? startedAt : date.toLocaleString();
}
