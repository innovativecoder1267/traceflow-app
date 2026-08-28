"use client";
import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ApiKeySuccessDialogProps {
  open: boolean;
  apiKey: string;
  onDone: () => void;
}

export function ApiKeySuccessDialog({
  open,
  apiKey,
  onDone,
}: ApiKeySuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied
      console.error("Failed to copy API key to clipboard");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) onDone(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Project Created</DialogTitle>
          <DialogDescription>
            Your project is ready. Save your API key now.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-[var(--color-destructive)]/20 bg-[var(--color-destructive)]/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-[var(--color-destructive)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-destructive)] leading-relaxed">
              This API key will only be shown once. Copy it now — you won&apos;t
              be able to retrieve it again.
            </p>
          </div>

          {/* API Key display */}
          <div className="space-y-1.5">
            <p className="text-xs text-[var(--color-muted-foreground)]">Your API Key</p>
            <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2.5">
              <code className="text-xs font-mono text-[var(--color-foreground)] flex-1 break-all">
                {apiKey}
              </code>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[var(--color-success)]" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button onClick={onDone}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
