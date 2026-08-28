"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KeyValueRow, RequestDraft, SavedRequest } from "./types";

interface RequestTabsProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
}

function KeyValueEditor({
  rows,
  onChange,
}: {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
}) {
  function updateRow(id: string, patch: Partial<KeyValueRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([
      ...rows,
      { id: `kv-${Date.now()}`, key: "", value: "", enabled: true },
    ]);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
        <span>Key</span>
        <span>Value</span>
        <span className="w-14 text-center">On</span>
      </div>
      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input
            value={row.key}
            onChange={(e) => updateRow(row.id, { key: e.target.value })}
            placeholder="key"
            className="h-8 text-xs"
          />
          <Input
            value={row.value}
            onChange={(e) => updateRow(row.id, { value: e.target.value })}
            placeholder="value"
            className="h-8 text-xs"
          />
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(row.id, { enabled: e.target.checked })}
            className="mx-auto h-4 w-4 accent-blue-500"
          />
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addRow}>
        Add row
      </Button>
    </div>
  );
}

export function RequestTabs({ draft, onChange }: RequestTabsProps) {
  const [tab, setTab] = useState("headers");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="headers">Headers</TabsTrigger>
        <TabsTrigger value="query">Query Params</TabsTrigger>
        <TabsTrigger value="body">Body</TabsTrigger>
        <TabsTrigger value="auth">Auth</TabsTrigger>
      </TabsList>

      <TabsContent value="headers">
        <KeyValueEditor
          rows={draft.headers}
          onChange={(headers) => onChange({ ...draft, headers })}
        />
      </TabsContent>

      <TabsContent value="query">
        <KeyValueEditor
          rows={draft.queryParams}
          onChange={(queryParams) => onChange({ ...draft, queryParams })}
        />
      </TabsContent>

      <TabsContent value="body">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
            JSON Body
          </p>
          <Textarea
            value={draft.body}
            onChange={(e) => onChange({ ...draft, body: e.target.value })}
            className="min-h-[240px] font-mono text-xs leading-relaxed"
            spellCheck={false}
            placeholder='{ "key": "value" }'
          />
        </div>
      </TabsContent>

      <TabsContent value="auth">
        <div className="space-y-2 max-w-md">
          <Label className="text-xs text-[var(--color-muted-foreground)]">
            Bearer Token
          </Label>
          <Input
            value={draft.bearerToken}
            onChange={(e) => onChange({ ...draft, bearerToken: e.target.value })}
            placeholder="TODO: wire to project API key or custom token"
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {/* TODO: Persist auth profile and attach Authorization header on send. */}
            Auth is mocked for now. Real integration will inject headers at send time.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
