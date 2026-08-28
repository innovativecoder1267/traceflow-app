"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MethodSelector } from "./MethodSelector";
import { RequestTabs } from "./RequestTabs";
import type { RequestDraft } from "./types";

interface RequestComposerProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onSend: () => void;
  onSave: () => void;
  sending: boolean;
  saving: boolean;
}

export function RequestComposer({
  draft,
  onChange,
  onSend,
  onSave,
  sending,
  saving,
}: RequestComposerProps) {
  return (
    <Card className="shrink-0 border-[var(--color-border)] bg-[var(--color-card)]">
      <CardHeader className="space-y-4 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-foreground)]">
          Request
        </CardTitle>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <MethodSelector
            value={draft.method}
            onChange={(method) => onChange({ ...draft, method })}
          />
          <Input
            value={draft.url}
            onChange={(e) => onChange({ ...draft, url: e.target.value })}
            placeholder="https://example.com/api/users"
            className="min-w-0 flex-1 font-mono text-xs"
          />
          <div className="flex shrink-0 gap-2">
            <Button onClick={onSend} disabled={sending || saving}>
              {sending ? "Sending…" : "Send"}
            </Button>
            <Button
              variant="outline"
              onClick={onSave}
              disabled={sending || saving}
            >
              {saving ? "Saving…" : "Save Request"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-[300px] pb-4">
        <RequestTabs draft={draft} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
