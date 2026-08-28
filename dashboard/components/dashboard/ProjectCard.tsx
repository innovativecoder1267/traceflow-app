"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { maskApiKey } from "@/lib/api-key";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  console.log("projects are",project)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(project.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — silently fail
    }
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-4 hover:border-[var(--color-ring)]/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-[var(--color-foreground)] truncate">
            {project.name}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 font-mono">
            {project._id.slice(0, 8)}…
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* API Key */}
      <div className="space-y-1">
        <p className="text-xs text-[var(--color-muted-foreground)]">API Key</p>
        <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-md px-3 py-1.5">
          <code className="text-xs font-mono text-[var(--color-foreground)] flex-1 truncate">
            {maskApiKey(project.apiKey)}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="Copy API key"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-xs text-[var(--color-success)]">Copied!</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Created {project.createdAt.slice(0, 10)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => router.push(`/dashboard/projects/${project._id}`)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
