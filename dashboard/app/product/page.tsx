"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, GitBranch, Search, Terminal, Layers3, Lightbulb } from "lucide-react";

const STORY_POINTS = [
  { icon: Terminal, title: "Start with the request", text: "TraceFlow keeps the request at the center. Instead of only showing that an API call happened, the goal is to capture useful information about what happened during that request." },
  { icon: GitBranch, title: "Follow the trace", text: "As the system grows, a request can cross services and make external calls. TraceFlow is being built to make that path easier to follow inside the same application." },
  { icon: Search, title: "Find the bottleneck", text: "The purpose of tracing is not simply collecting data. It is helping a developer move from a slow or failing request to the part of the request that needs attention." },
  { icon: Layers3, title: "Spans are next", text: "The next stage is deeper span-level visibility, especially around external requests, so developers can see where time is actually being spent and investigate bottlenecks faster." },
];

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#030712] text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={15} />Back to TraceFlow</Link>
        <section className="mx-auto max-w-4xl py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 font-mono text-xs text-indigo-300"><Lightbulb size={13} />why TraceFlow exists</div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">An API tool that does more than<span className="block bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">send the request.</span></h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">TraceFlow was created around a simple idea: when a developer sends a request, they should be able to understand what happened to that request—not just see its response.</p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {STORY_POINTS.map((point) => { const Icon = point.icon; return (
            <article key={point.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.055]">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300"><Icon size={18} /></div>
              <h2 className="text-lg font-semibold">{point.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{point.text}</p>
            </article>
          ); })}
        </section>

        <section className="mx-auto max-w-4xl py-24">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.10] via-white/[0.03] to-cyan-500/[0.06] p-8 md:p-12">
            <div className="flex items-center gap-2 font-mono text-xs text-indigo-300"><CheckCircle2 size={14} />the problem TraceFlow is solving</div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">From “the request is slow” to “this is where it is slow.”</h2>
            <p className="mt-5 text-sm leading-7 text-slate-400 md:text-base">Developers often have to move between request tools, logs, metrics, and tracing systems to understand a problem. TraceFlow is being built to bring more of that context into the same workflow: make the API request, capture its trace, inspect the information around it, and use that information to locate the bottleneck faster.</p>
            <p className="mt-5 text-sm leading-7 text-slate-400 md:text-base">The idea was shaped by working with tracing tools such as Jaeger. Jaeger showed what distributed tracing could do, but TraceFlow was created with a different product experience in mind—one that feels closer to the developer’s request workflow and makes investigating a trace straightforward.</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl pb-24">
          <div className="border-t border-white/10 pt-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Built as a learning project. Designed as a real system.</p>
            <h2 className="mt-4 text-2xl font-semibold">The architecture is part of the product.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 md:text-base">TraceFlow’s architecture has been designed from the ground up, including request context isolation, trace handling, storage, and the path from an incoming request to the developer dashboard. Building it also meant digging into how request context can be isolated and propagated with AsyncLocalStorage and how a tracing system should behave as the number of requests grows.</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl border-t border-white/10 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-300">what comes next</p>
          <h2 className="mt-4 text-3xl font-semibold">Toward automated telemetry.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">The long-term direction is to capture spans automatically, including external requests, so developers do not have to manually instrument every part of their application just to understand where a request is spending its time.</p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-5 py-3 text-sm font-medium text-slate-950 transition hover:-translate-y-0.5">Explore TraceFlow<ArrowRight size={15} /></Link>
        </section>
      </div>
    </main>
  );
}
