import { FolderOpen, GitBranch, CheckCircle2, Cpu } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentTracesSection } from "@/components/dashboard/RecentTracesSection";
import { RecentProjectsSection } from "@/components/dashboard/RecentProjectsSection";
import type { Project } from "@/types/project";
import type { Trace } from "@/types/trace";
import axios from "axios";
async function getMetrics() {
  try {
   
    const res = await axios.get(`http://localhost:3001/api/fetchproject`,{
      withCredentials: true,
    });
    if (!res.data) return { projects: 0, traces: 0, successRate: "—", activeSDKs: 0 };
    const projects: Project[] = await res.data.data;
    return {
      projects: projects.length,
      traces: 0,
      successRate: "—",
      activeSDKs: 0,
    };
  } catch {
    return { projects: 0, traces: 0, successRate: "—", activeSDKs: 0 };
  }
}

async function getRecentProjects(): Promise<{ data: Project[]; error: boolean }> {
  try {

        const res = await axios.get(
      "http://localhost:3001/api/projects",
      {
        withCredentials:true
      }
    );
    if (!res.data) return { data: [], error: true };
    const data: Project[] = await res.data.data;
    return { data, error: false };
  } catch {
    return { data: [], error: true };
  }
}

export default async function OverviewPage() {
  const [metrics, recentProjects] = await Promise.all([
    getMetrics(),
    getRecentProjects(),
  ]);

  const recentTraces: { data: Trace[]; error: boolean } = {
    data: [],
    error: false,
  };

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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Projects"
          value={metrics.projects}
          icon={<FolderOpen className="h-4 w-4" />}
        />
        <MetricCard
          label="Total Traces"
          value={metrics.traces}
          icon={<GitBranch className="h-4 w-4" />}
        />
        <MetricCard
          label="Success Rate"
          value={metrics.successRate}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <MetricCard
          label="Active SDKs"
          value={metrics.activeSDKs}
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      {/* Recent Traces */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Traces
        </h2>
        <RecentTracesSection
          traces={recentTraces.data}
          error={recentTraces.error}
        />
      </section>

      {/* Recent Projects */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Recent Projects
        </h2>
        <RecentProjectsSection
          projects={recentProjects.data}
          error={recentProjects.error}
        />
      </section>
    </div>
  );
}
