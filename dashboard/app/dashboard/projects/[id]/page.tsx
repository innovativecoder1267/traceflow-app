"use client"

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ApiExplorer } from "@/components/api-explorer/ApiExplorer";
import type { Project } from "@/types/project";
import axios from "axios";
import { useState,useEffect } from "react"; 
import { useParams } from "next/dist/client/components/navigation";

async function getProject(id: string): Promise<{
  data: Project | null;
  status: number;
}> {
  console.log("Fetching project with ID:", id);
  try {
    const res = await axios.get(
      `http://localhost:3001/api/fetchproject/${id}`,
      {
        withCredentials: true,
      }
    );
    console.log("Response from API:", res.data);
    return {
      data: res.data.data,
      status: res.status,
    };
  } catch (err: any) {
    return {
      data: null,
      status: err.response?.status || 500,
    };
  }
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<number>(0);
  useEffect(() => {
    async function fetchProject() {
      const res = await getProject(id);
      setProject(res.data);
      setStatus(res.status);
    }

    fetchProject();
  }, [id]);

  if (status === 0) {
    return (
      <div className="p-8 text-center">
        Loading...
      </div>
    );
  }

  if (status === 404 || !project) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>

        <div className="rounded-lg border p-8 text-center">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  if (status !== 200) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>

        <div className="rounded-lg border p-8 text-center">
          <p>Failed to load project (error {status})</p>
        </div>
      </div>
    );
  }

  return (
    <ApiExplorer
      projectName={project.name}
      projectId={project._id}
    />
  );
}
