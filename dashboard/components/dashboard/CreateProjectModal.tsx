"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios"
interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (apiKey: string) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleOpenChange(val: boolean) {
    if (!loading) {
      onOpenChange(val);
      if (!val) {
        setError("");
        setServerError("");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/api/createproject", {
        name: name.trim()
      },
    {
      withCredentials:true
    });
      const data = res.data;
      if (!res.data) {
        setServerError(data.error ?? "Failed to create project");
        return;
      }
      console.log("the api key is",res)
      setName("");
      onSuccess(data.apiKey);
    } catch {
      setServerError("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              type="text"
              placeholder="My App"
              maxLength={100}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className={error ? "border-[var(--color-destructive)]" : ""}
              autoFocus
            />
            {error && (
              <p className="text-xs text-[var(--color-destructive)]">{error}</p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-[var(--color-destructive)] rounded-md border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
