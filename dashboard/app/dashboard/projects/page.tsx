"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, FolderOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { ApiKeySuccessDialog } from "@/components/dashboard/ApiKeySuccessDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import axios from "axios";
type LoadState = "loading" | "error" | "success";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [modalOpen,setModalOpen] = useState(false);
  const [successApiKey, setSuccessApiKey] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

const fetchProjects = useCallback(async () => {
  setLoadState("loading");

  try {
    const res = await axios.get(
      "http://localhost:3001/api/projects",
      {
        withCredentials: true,
      }
    );

    console.log(res.data);

    setProjects(res.data.data);
    setLoadState("success");
  } catch (err) {
    console.log(err);
    setLoadState("error");
  }
}, []);

useEffect(() => {
  fetchProjects();
}, [fetchProjects]);
 

  function handleModalSuccess(apiKey: string) {
    setModalOpen(false);
    setSuccessApiKey(apiKey);
    setSuccessDialogOpen(true);
  }

  function handleDone() {
    setSuccessDialogOpen(false);
    setSuccessApiKey("");
    fetchProjects();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Projects
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            Manage your TraceFlow projects
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Content */}
      {loadState === "loading" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] animate-pulse"
            />
          ))}
        </div>
      )}

      {loadState === "error" && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3 rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5">
          <AlertCircle className="h-6 w-6 text-[var(--color-destructive)]" />
          <p className="text-sm text-[var(--color-destructive)]">
            Failed to load projects. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={fetchProjects}>
            Retry
          </Button>
        </div>
      )}

      {loadState === "success" && projects.length === 0 && (
        <EmptyState
          icon={<FolderOpen className="h-5 w-5" />}
          heading="No projects yet"
          description="Create your first project to start collecting traces from your application."
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          }
        />
      )}

      {loadState === "success" && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleModalSuccess}
      />

      <ApiKeySuccessDialog
        open={successDialogOpen}
        apiKey={successApiKey}
        onDone={handleDone}
      />
    </div>
  );
} 