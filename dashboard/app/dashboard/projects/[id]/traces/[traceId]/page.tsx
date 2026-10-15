"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowDown, CheckCircle2, Clock3, Database, Globe, Pause, Play, RotateCcw, Activity, AlertCircle } from "lucide-react";
import type { Span, Trace } from "@/types/trace";

type Params = { id: string; traceId: string };
type Stage = { key: string; name: string; kind: "request" | "http" | "db" | "other" | "response"; start: number; duration: number; status?: string; metadata?: Record<string, unknown>; span?: Span };
const API = "https://traceflow-app-k2ed.vercel.app";

export default function TraceJourneyPage({ params }: { params: Promise<Params> }) {
  const [route, setRoute] = useState<Params | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frame = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => { let alive = true; params.then((value) => { if (alive) setRoute(value); }); return () => { alive = false; }; }, [params]);

  useEffect(() => {
    if (!route) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(null);
      try {
        const response = await fetch(API + "/api/traces?projectId=" + encodeURIComponent(route!.id), { credentials: "include", signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load trace details.");
        const data: { traces?: Trace[] } = await response.json();
        const found = (data.traces ?? []).find((item) => [item._id, item.id, item.traceId].some((value) => value === route!.traceId));
        if (!found) throw new Error("This trace could not be found in this project.");
        setTrace(found);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unable to load trace details.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [route]);

  const stages = useMemo<Stage[]>(() => {
    if (!trace) return [];
    const start = toMs(trace.startedAt);
    const total = Math.max(1, Number(trace.duration) || 0, toMs(trace.endedAt) - start);
    const spans = (Array.isArray(trace.spans) ? trace.spans : []).map((span, i) => {
      const spanStart = Math.max(0, toMs(span.startedAt) - start);
      const spanEnd = span.endedAt ? Math.max(spanStart, toMs(span.endedAt) - start) : spanStart + (Number(span.duration) || 0);
      const label = (String(span.type || "") + " " + span.name).toLowerCase();
      const kind: Stage["kind"] = /http|fetch|request|api/.test(label) ? "http" : /db|database|mongo|query|redis|sql/.test(label) ? "db" : "other";
      return { key: span.name + "-" + i, name: span.name || "Span " + (i + 1), kind, start: spanStart, duration: Number(span.duration) || Math.max(0, spanEnd - spanStart), status: span.status, metadata: span.metadata, span };
    }).sort((a, b) => a.start - b.start);
    return [
      { key: "incoming", name: "Incoming request · " + trace.method + " " + (trace.path || trace.route || ""), kind: "request", start: 0, duration: 0, status: "Recorded" },
      ...spans,
      { key: "response", name: "Response completed", kind: "response", start: total, duration: Number(trace.duration) || total, status: trace.status || (trace.statusCode >= 200 && trace.statusCode < 400 ? "SUCCESS" : "ERROR") }
    ];
  }, [trace]);

  const duration = useMemo(() => Math.max(1, Number(trace?.duration) || 0, ...stages.map((s) => s.start + s.duration)), [trace, stages]);
  const current = useMemo(() => {
    if (!stages.length) return 0;
    const time = duration * progress / 100;
    let index = 0;
    stages.forEach((stage, i) => { if (stage.start <= time) index = i; });
    return Math.min(index, stages.length - 1);
  }, [progress, stages, duration]);

  const stop = useCallback(() => {
    setPlaying(false); last.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  const tick = useCallback((now: number) => {
    if (last.current === null) last.current = now;
    const delta = now - last.current; last.current = now;
    setProgress((p) => Math.min(100, p + delta / 9000 * 100 * speed));
    frame.current = requestAnimationFrame(tick);
  }, [speed, stop]);
  useEffect(() => {
    if (playing) { last.current = null; frame.current = requestAnimationFrame(tick); }
    else if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null; last.current = null; }
    return () => { if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [playing, tick]);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  useEffect(() => { if (playing) setSelected(current); }, [playing, current]);
  useEffect(() => { if (playing && progress >= 100) stop(); }, [playing, progress, stop]);

  const activeTrace = !!trace && trace.statusCode >= 200 && trace.statusCode < 400;
  const chosen = stages[selected];

  function startJourney() { if (progress >= 100) { setProgress(0); setSelected(0); } setPlaying(true); }
  function replay() { stop(); setProgress(0); setSelected(0); }

  return (
    <div className="-m-6 min-h-[calc(100vh-3.5rem)] bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="border-b border-[var(--color-border)] px-5 py-5 sm:px-8">
        <Link href={"/dashboard/projects/" + encodeURIComponent(route?.id ?? "")} className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"><ArrowLeft size={14} /> Back to project</Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="mb-1 text-xs text-[var(--color-muted-foreground)]">TRACE DETAILS</p><h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{trace ? trace.method + " " + (trace.path || trace.route || "") : "Request journey"}</h1><p className="mt-1 text-sm text-[var(--color-muted-foreground)]">Explore the operations recorded during this request.</p></div>
          {trace && <span className={"rounded-full border px-2.5 py-1 text-xs " + (activeTrace ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400")}>{trace.statusCode} · {activeTrace ? "Success" : "Failure"}</span>}
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-8">
        {loading ? <div className="rounded-xl border border-[var(--color-border)] p-6 text-sm text-[var(--color-muted-foreground)]">Loading trace details…</div> : error || !trace ? <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] p-5 text-sm text-[var(--color-destructive)]"><AlertCircle size={16} /> {error || "Trace not found."}</div> : <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Total duration" value={trace.duration + " ms"} icon={<Clock3 size={16} />} />
            <Metric label="Recorded spans" value={String(Array.isArray(trace.spans) ? trace.spans.length : 0)} icon={<Activity size={16} />} />
            <Metric label="Started at" value={formatDate(trace.startedAt)} icon={<CheckCircle2 size={16} />} />
          </section>
          <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4 sm:p-5">
              <div><h2 className="font-semibold">Request journey</h2><p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Replay the recorded request and inspect each captured operation.</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={playing ? stop : startJourney} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--color-foreground)] px-3 py-2 text-xs font-medium text-[var(--color-background)] hover:opacity-85">{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Pause" : progress >= 100 ? "Play again" : progress > 0 ? "Resume" : "Start journey"}</button>
                <button type="button" onClick={replay} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs hover:bg-[var(--color-muted)]/20"><RotateCcw size={14} /> Replay</button>
                <label className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">Speed<select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="min-h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-[var(--color-foreground)]"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
              </div>
            </div>
            <div className="space-y-5 p-4 sm:p-5">
              <div className="flex justify-between text-xs text-[var(--color-muted-foreground)]"><span>{playing ? "Journey playing…" : progress >= 100 ? "Journey completed" : progress > 0 ? "Journey paused" : "Ready to play"}</span><span className="font-mono">{Math.round(progress)}%</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-muted)]/30"><div className="h-full rounded-full bg-[var(--color-foreground)] transition-[width] duration-100" style={{ width: progress + "%" }} /></div>
              <div className="space-y-3">
                {stages.map((stage, i) => {
                  const isActive = (playing ? current : selected) === i;
                  const left = Math.min(100, Math.max(0, stage.start / duration * 100));
                  const width = stage.duration > 0 ? Math.max(1.5, Math.min(100 - left, stage.duration / duration * 100)) : 1.5;
                  return <button key={stage.key} type="button" onClick={() => { stop(); setSelected(i); setProgress(Math.min(100, stage.start / duration * 100)); }} className={"block w-full rounded-xl border p-3 text-left transition-all duration-300 sm:p-4 " + (isActive ? "border-[var(--color-foreground)]/50 bg-[var(--color-muted)]/15" : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]/40")}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)]">{stage.kind === "http" ? <Globe size={16} /> : stage.kind === "db" ? <Database size={16} /> : stage.kind === "response" ? <CheckCircle2 size={16} /> : stage.kind === "request" ? <ArrowDown size={16} /> : <Activity size={16} />}</div>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><span className="break-words text-sm font-medium">{stage.name}</span><span className="font-mono text-xs text-[var(--color-muted-foreground)]">{stage.duration > 0 ? formatDuration(stage.duration) + " ms" : stage.kind === "request" ? "Start" : "End"}</span></div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[var(--color-muted-foreground)]">{stage.span && <span>{stage.kind === "http" ? "HTTP span" : stage.kind === "db" ? "Database span" : "Custom span"}</span>}{stage.status && <span>· {stage.status}</span>}{stage.start > 0 && <span>· starts at {formatDuration(stage.start)} ms</span>}</div>
                        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-muted)]/25"><div className={"absolute top-0 h-full rounded-full transition-all duration-500 " + (stage.kind === "http" ? "bg-sky-400" : stage.kind === "db" ? "bg-emerald-400" : "bg-[var(--color-foreground)]/60")} style={{ left: left + "%", width: width + "%" }} />{isActive && playing && <div className="absolute inset-y-0 w-1 animate-pulse rounded-full bg-[var(--color-foreground)]" style={{ left: Math.min(99, progress) + "%" }} />}</div>
                      </div>
                    </div>
                  </button>;
                })}
              </div>
              {chosen && <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Operation details</h3><span className="text-xs text-[var(--color-muted-foreground)]">Stage {selected + 1} of {stages.length}</span></div><div className="break-words text-sm font-medium">{chosen.name}</div>
                {chosen.span ? <div className="mt-3 space-y-3"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Detail label="Type" value={chosen.span.type || inferredType(chosen.span)} /><Detail label="Duration" value={chosen.duration + " ms"} /><Detail label="Status" value={chosen.span.status || "Not recorded"} /></div>{chosen.metadata && Object.keys(chosen.metadata).length > 0 && <div><div className="mb-1.5 text-xs text-[var(--color-muted-foreground)]">Recorded metadata</div><pre className="max-h-72 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-xs leading-relaxed">{JSON.stringify(chosen.metadata, null, 2)}</pre></div>}</div> : <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{chosen.kind === "request" ? "The incoming request started the trace. Only operations recorded by TraceFlow are shown." : "The request finished. Total duration and response status are shown in the trace summary."}</p>}
              </div>}
              {(!trace.spans || trace.spans.length === 0) && <p className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-xs text-[var(--color-muted-foreground)]">No span info found for this trace. You can still inspect the incoming request and completion timing.</p>}
            </div>
          </section>
        </>}
      </main>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"><div className="mb-3 flex items-center justify-between text-[var(--color-muted-foreground)]"><span className="text-xs">{label}</span>{icon}</div><div className="break-words text-sm font-semibold">{value}</div></div>;
}
function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-[var(--color-border)] p-3"><div className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">{label}</div><div className="mt-1 break-words text-xs">{value}</div></div>;
}
function toMs(value?: string | number): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}
function formatDuration(value: number): string { return Number.isFinite(value) ? value.toFixed(value < 10 ? 1 : 0) : "0"; }
function formatDate(value: string | number): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString(); }
function inferredType(span: Span): string {
  const value = (span.name + " " + JSON.stringify(span.metadata ?? {})).toLowerCase();
  if (/http|fetch|api|url/.test(value)) return "HTTP";
  if (/database|mongo|query|redis|sql|db/.test(value)) return "Database";
  return "Custom";
}
