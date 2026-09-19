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
  const [projectsError, setProjectsError] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await axios.get(
          "https://traceflow-app-k2ed.vercel.app/api/projects",
          { withCredentials: true }
        );

        console.log("[OVERVIEW] Projects response:", res.data);
        setProjects(res.data.data ?? []);
        setProjectsError(false);
      } catch (error) {
        console.error("[OVERVIEW] Failed to load projects:", error);
        setProjects([]);
        setProjectsError(true);
      }
    }

    loadProjects();
  }, []);

  const recentTraces: Trace[] = [];

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
          value="—"
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
        <RecentTracesSection traces={recentTraces} error={false} />
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
