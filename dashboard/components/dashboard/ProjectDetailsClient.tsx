"use client";
import { useState } from "react";
import { Copy, Check, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskApiKey } from "@/lib/api-key";
import type { Project } from "@/types/project";

interface ProjectDetailsClientProps {
  project: Project;
}

export function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const [maskedKey, setMaskedKey] = useState(maskApiKey(project.apiKey));
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const sdkSnippet = `TraceFlow.init({\n  apiKey: "${project.apiKey.slice(0, 12)}xxxxxxxxx"\n})`;

  async function handleCopyKey() {
    try {
      await navigator.clipboard.writeText(project.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // clipboard access denied
    }
  }

  async function handleCopySnippet() {
    try {
      await navigator.clipboard.writeText(
        `TraceFlow.init({\n  apiKey: "${project.apiKey}"\n})`
      );
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch {
      // clipboard access denied
    }
  }

  async function handleRegen() {
    setRegenError("");
    setRegenLoading(true);
    try {
      // Placeholder — regenerate endpoint not yet implemented
      await new Promise((r) => setTimeout(r, 800));
      setMaskedKey("****regen");
      setShowConfirm(false);
    } catch {
      setRegenError("Failed to regenerate key. Please try again.");
    } finally {
      setRegenLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--color-foreground)]">
            API Key
          </h2>
          {!showConfirm && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowConfirm(true)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regenerate Key
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2.5">
          <code className="text-xs font-mono text-[var(--color-foreground)] flex-1">
            {maskedKey}
          </code>
          <button
            onClick={handleCopyKey}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="Copy API key"
          >
            {copiedKey ? (
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {copiedKey && (
          <p className="text-xs text-[var(--color-success)]">Copied!</p>
        )}

        {/* Confirm regen */}
        {showConfirm && (
          <div className="rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--color-destructive)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-destructive)] leading-relaxed">
                Regenerating will invalidate the current API key immediately. Any
                applications using it will stop working.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={handleRegen}
                disabled={regenLoading}
              >
                {regenLoading ? "Regenerating…" : "Yes, Regenerate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowConfirm(false)}
                disabled={regenLoading}
              >
                Cancel
              </Button>
            </div>
            {regenError && (
              <p className="text-xs text-[var(--color-destructive)]">{regenError}</p>
            )}
          </div>
        )}
      </div>

      {/* SDK Installation */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 space-y-4">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          SDK Installation
        </h2>
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Install the TraceFlow SDK
          </p>
          <div className="rounded-md bg-[var(--color-muted)] border border-[var(--color-border)] px-4 py-3">
            <code className="text-xs font-mono text-[var(--color-foreground)]">
              npm install @traceflow/sdk
            </code>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Initialise in your app
            </p>
            <button
              onClick={handleCopySnippet}
              className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              {copiedSnippet ? (
                <>
                  <Check className="h-3 w-3 text-[var(--color-success)]" />
                  <span className="text-[var(--color-success)]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-md bg-[var(--color-muted)] border border-[var(--color-border)] px-4 py-3">
            <pre className="text-xs font-mono text-[var(--color-foreground)] whitespace-pre">
              {sdkSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
