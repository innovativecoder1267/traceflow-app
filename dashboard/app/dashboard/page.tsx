"use client";

import { useEffect, useState } from "react";
import { FolderOpen, GitBranch, CheckCircle2, Cpu } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentTracesSection } from "@/components/dashboard/RecentTracesSection";
import { RecentProjectsSection } from "@/components/dashboard/RecentProjectsSection";
import type { Project } from "@/types/project";
import type { Trace } from "@/types/trace";
import axios from "axios";

export default function OverviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTraces, setRecentTraces] = useState<Trace[]>([]);
  const [projectsError, setProjectsError] = useState(false);
  const [tracesError, setTracesError] = useState(false);

  useEffect(() => {
    async function loadOverview() {
      try {
        const projectsResponse = await axios.get(
          "https://traceflow-app-k2ed.vercel.app/api/projects",
          { withCredentials: true }
        );

        const fetchedProjects: Project[] = projectsResponse.data.data ?? [];
        console.log("[OVERVIEW] Projects response:", projectsResponse.data);

        setProjects(fetchedProjects);
        setProjectsError(false);

        if (fetchedProjects.length === 0) {
          setRecentTraces([]);
          setTracesError(false);
          return;
        }

        const traceResponses = await Promise.all(
          fetchedProjects.map((project) =>
            axios.get(
              `https://traceflow-app-k2ed.vercel.app/api/traces?projectId=${encodeURIComponent(project._id)}`,
              { withCredentials: true }
            )
          )
        );

        const allTraces = traceResponses.flatMap(
          (response) => (response.data.traces ?? []) as Trace[]
        );

        const latestTraces = allTraces
          .sort(
            (a, b) =>
              new Date(b.startedAt).getTime() -
              new Date(a.startedAt).getTime()
          )
          .slice(0, 3);

        console.log("[OVERVIEW] Recent traces:", latestTraces);

        setRecentTraces(latestTraces);
        setTracesError(false);
      } catch (error) {
        console.error("[OVERVIEW] Failed to load dashboard data:", error);

        // Keep project data if it loaded successfully but trace fetching failed.
        if (projects.length > 0) {
          setTracesError(true);
        } else {
          setProjectsError(true);
        }
      }
    }

    void loadOverview();
  }, []);

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Projects"
          value={projects.length}
          icon={<FolderOpen className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Traces"
          value={recentTraces.length}
          icon={<GitBranch className="h-4 w-4" />}
        />
        <MetricCard
          label="Success Rate"
          value="—"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Active SDKs"
          value="—"
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Traces
        </h2>
        <RecentTracesSection
          traces={recentTraces}
          error={tracesError}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Projects
        </h2>
        <RecentProjectsSection
          projects={projects}
          error={projectsError}
        />
      </section>
    </div>
  );
}
