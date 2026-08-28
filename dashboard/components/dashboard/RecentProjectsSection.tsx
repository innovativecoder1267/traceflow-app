import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import type { Project } from "@/types/project";

interface RecentProjectsSectionProps {
  projects: Project[];
  error?: boolean;
}

export function RecentProjectsSection({ projects, error }: RecentProjectsSectionProps) {
  const sorted = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-4 py-8 text-center">
        <p className="text-sm text-[var(--color-destructive)]">
          Failed to load recent projects
        </p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-5 w-5" />}
        heading="No projects yet"
        description="Create your first project to start collecting traces from your application."
        action={
          <Link
            href="/dashboard/projects"
            className="text-xs text-[var(--color-foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Create a project →
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((project) => (
        <Link
          key={project._id}
          href={`/dashboard/projects/${project._id}`}
          className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-ring)]/40 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
              {project.name}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {project.createdAt.slice(0, 10)}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </Link>
      ))}
    </div>
  );
}
