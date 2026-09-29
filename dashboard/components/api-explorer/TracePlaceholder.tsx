"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Span, Trace } from "@/types/trace";

interface TracePlaceholderProps {
  projectId: string;
}

export function TracePlaceholder({ projectId }: TracePlaceholderProps) {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTraces() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://traceflow-app-k2ed.vercel.app/api/traces?projectId=${encodeURIComponent(projectId)}`,
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
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading traces…</p>
        ) : error ? (
          <p className="text-xs text-[var(--color-destructive)]">{error}</p>
        ) : traces.length === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No traces captured for this project yet.
          </p>
        ) : (
          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {traces.map((trace) => {
              const traceKey = trace._id || trace.traceId || trace.id || `${trace.method}-${trace.startedAt}`;
              const isExpanded = expandedTraceId === traceKey;
              const spans = Array.isArray(trace.spans) ? trace.spans : [];

              return (
                <div
                  key={traceKey}
                  className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs"
                >
                  <div className="space-y-1.5">
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
                        {trace.statusCode} ·{" "}
                        {trace.statusCode >= 200 && trace.statusCode < 400
                          ? "Success"
                          : "Failure"}
                      </span>
                    </div>

                    <p className="text-[var(--color-muted-foreground)]">
                      {trace.duration}ms · {formatStartedAt(trace.startedAt)}
                    </p>

                    <p className="break-all font-mono text-[10px] text-[var(--color-muted-foreground)]">
                      {trace.traceId || trace.id}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTraceId(isExpanded ? null : traceKey)
                      }
                      className="pt-1 font-medium text-[var(--color-foreground)] hover:underline"
                    >
                      {isExpanded ? "Hide spans" : `Spans · ${spans.length}`}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                      {spans.length === 0 ? (
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          No span info found.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {spans.map((span: Span, index: number) => (
                            <div
                              key={`${span.name}-${index}`}
                              className="rounded-md bg-[var(--color-muted)]/30 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-[var(--color-foreground)]">
                                  {span.name}
                                </span>
                                <span className="text-[var(--color-muted-foreground)]">
                                  {span.duration}ms
                                </span>
                              </div>

                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--color-muted-foreground)]">
                                {span.type && <span>Type: {span.type}</span>}
                                {span.status && (
                                  <span>Status: {span.status}</span>
                                )}
                              </div>

                              {span.metadata &&
                                Object.keys(span.metadata).length > 0 && (
                                  <pre className="mt-2 overflow-x-auto rounded bg-[var(--color-background)] p-2 font-mono text-[10px] text-[var(--color-muted-foreground)]">
                                    {JSON.stringify(span.metadata, null, 2)}
                                  </pre>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
