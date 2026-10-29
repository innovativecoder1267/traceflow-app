"use client";

import Link from "next/link";
import { LockKeyhole, ChartNoAxesCombined, ArrowRight } from "lucide-react";
import { useSubscription } from "@/providers/SubscriptionProvider";

const upcomingFeatures = [
  {
    title: "Deep Inspection",
    description: "Explore request timelines and understand where time is spent.",
  },
  {
    title: "Bottleneck Detection",
    description: "Find slow operations and investigate performance hotspots.",
  },
  {
    title: "Historical Data",
    description: "Compare performance trends across time ranges.",
  },
];

export default function PerformanceAnalyticsPage() {
  const { subscription, isSubscriptionLoading } = useSubscription();
  const isPremium = subscription === "premium";

  if (isSubscriptionLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="h-7 w-64 animate-pulse rounded bg-[var(--color-accent)]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[var(--color-accent)]" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <section className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <LockKeyhole className="h-5 w-5 text-[var(--color-muted-foreground)]" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            Premium feature
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            Performance Analytics
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--color-muted-foreground)]">
            Get a deeper understanding of your application performance with
            request-level inspection, bottleneck detection, and historical trends.
            This area is locked on the Free plan.
          </p>

          <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
            {upcomingFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-[var(--color-border)] p-4"
              >
                <LockKeyhole className="mb-3 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <h2 className="text-sm font-medium text-[var(--color-foreground)]">
                  {feature.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[var(--color-muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/settings"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
          >
            View account settings <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            Plan upgrades will be available here once billing is implemented.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]">
          <ChartNoAxesCombined className="h-5 w-5 text-[var(--color-foreground)]" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
              Performance Analytics
            </h1>
            <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted-foreground)]">
              Premium
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Your workspace for investigating latency, bottlenecks, and performance trends.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-base font-medium text-[var(--color-foreground)]">
          Analytics workspace
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
          Your Premium access is active. We’ll build the analytics views here next,
          starting with deep inspection, bottleneck detection, and historical data.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {upcomingFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-[var(--color-border)] p-4"
            >
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-[var(--color-muted-foreground)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
