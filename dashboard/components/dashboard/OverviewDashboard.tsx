"use client";

import { useEffect, useState } from "react";
import { FolderOpen, GitBranch, CheckCircle2, Cpu } from "lucide-react";
import axios from "axios";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentTracesSection } from "@/components/dashboard/RecentTracesSection";
import { RecentProjectsSection } from "@/components/dashboard/RecentProjectsSection";
import type { Project } from "@/types/project";
import type { Trace } from "@/types/trace";

const BACKEND_URL = "http://localhost:3001";

type LoadState = "loading" | "error" | "success";

interface OverviewMetrics {
  projects: number;
  traces: number;
  successRate: string;
  activeSDKs: string | number;
}
function mapBackendTrace(
  raw: Record<string, unknown>
): Trace {
  const rawProjectId = raw.projectId ?? raw.projectid;

  const projectId =
    typeof rawProjectId === "object" &&
    rawProjectId !== null &&
    "_id" in rawProjectId
      ? String((rawProjectId as { _id: unknown })._id)
      : String(rawProjectId ?? "");

  const statusCode = Number(raw.statusCode ?? 0);

  const status =
    raw.status === "SUCCESS" ||
    (statusCode >= 200 && statusCode < 400)
      ? "SUCCESS"
      : "ERROR";

  return {
    _id: String(raw._id ?? ""),
    projectId,
    traceId: String(raw.traceId ?? raw.id ?? ""),
    method: String(raw.method ?? ""),
    route: String(raw.route ?? raw.path ?? ""),
    statusCode,
    startedAt: String(raw.startedAt ?? ""),
    endedAt: String(raw.endedAt ?? ""),
    duration: Number(raw.duration ?? 0),
    status,
    spans: Array.isArray(raw.spans) ? raw.spans.map(String) : [],
    createdAt: String(raw.createdAt ?? raw.startedAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

function computeSuccessRate(traces: Trace[]): string {
  if (traces.length === 0) return "—";
  const successful = traces.filter((trace) => trace.status === "SUCCESS").length;
  return `${((successful / traces.length) * 100).toFixed(1)}%`;
}

export function OverviewDashboard() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [projectsError, setProjectsError] = useState(false);
  const [tracesError, setTracesError] = useState(false);
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    projects: 0,
    traces: 0,
    successRate: "—",
    activeSDKs: "—",
  });
  const [recentTraces,setRecentTraces]=useState<Trace[]>([])
  const projectNames = projects.reduce<Record<string, string>>((acc, project) => {
    acc[project._id] = project.name;
    return acc;
  }, {});

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverviewData() {
      setLoadState("loading");
      setProjectsError(false);
      setTracesError(false);

      try {
        const projectsRes = await axios.get(`http://localhost:3001/api/projects`, {
          withCredentials: true,
          signal: controller.signal,
        });

        const userProjects: Project[] = projectsRes.data?.data ?? [];
        setProjects(userProjects);

        const traceResults = await Promise.allSettled(
          userProjects.map(async (project) => {
            const response = await fetch(
              `http://localhost:3001/api/traces?projectId=${encodeURIComponent(project._id)}`,
              { credentials: "include", signal: controller.signal }
            );

            if (!response.ok) {
              throw new Error("Unable to load traces");
            }

            const data: { traces?: Record<string, unknown>[] } =
              await response.json();

            return (data.traces ?? []).map(mapBackendTrace);
          })
        );

        const failedTraceFetch = traceResults.some(
          (result) => result.status === "rejected"
        );
        setTracesError(failedTraceFetch);

        const allTraces = traceResults.flatMap((result) =>
          result.status === "fulfilled" ? result.value : []
        );

        setTraces(allTraces);
        setMetrics({
          projects: userProjects.length,
          traces: allTraces.length,
          successRate: computeSuccessRate(allTraces),
          activeSDKs: "—",
        });
        setLoadState("success");
      } catch (err) {
        if (
          (axios.isAxiosError(err) && err.code === "ERR_CANCELED") ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setProjects([]);
        setTraces([]);
        setProjectsError(true);
        setTracesError(true);
        setMetrics({
          projects: 0,
          traces: 0,
          successRate: "—",
          activeSDKs: "—",
        });
        setLoadState("error");
      }
    }

    void loadOverviewData();
    return () => controller.abort();
  }, []);
  useEffect(() => {
    async function fetchActivetraces() {
      try {
        const response=await axios.get("http://localhost:3001/api/fetch-trace", {
          withCredentials: true,
        });
      const tracesData: Trace[] = (response.data?.data ?? []).map(
        mapBackendTrace
      );
        setRecentTraces(tracesData);

      } catch (error) {
        console.error("Error fetching active traces:", error);
      }
    }
    void fetchActivetraces();
  }, []);
  const isLoading = loadState === "loading";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Overview
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Your TraceFlow activity at a glance
        </p>
      </div>

      {loadState === "error" && (
        <div className="rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-4 py-3">
          <p className="text-sm text-[var(--color-destructive)]">
            Failed to load overview data. Some sections may be unavailable.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Projects"
          value={metrics.projects}
          icon={<FolderOpen className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricCard
          label="Total Traces"
          value={metrics.traces}
          icon={<GitBranch className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricCard
          label="Success Rate"
          value={metrics.successRate}
          icon={<CheckCircle2 className="h-4 w-4" />}
          loading={isLoading}
        />
        <MetricCard
          label="Active SDKs"
          value={metrics.activeSDKs}
          icon={<Cpu className="h-4 w-4" />}
          loading={isLoading}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Traces
        </h2>
        <RecentTracesSection
          traces={recentTraces}
          error={tracesError && recentTraces.length === 0 && projects.length > 0}
          loading={isLoading}
          projectNames={projectNames}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Projects
        </h2>
        <RecentProjectsSection
          projects={projects}
          error={projectsError && loadState === "error"}
        />
      </section>
    </div>
  );
}
