"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CollectionSidebar } from "./CollectionSidebar";
import { RequestComposer } from "./RequestComposer";
import { ResponseViewer } from "./ResponseViewer";
import { TracePlaceholder } from "./TracePlaceholder";
import { DEFAULT_JSON_BODY, INITIAL_COLLECTIONS } from "./mock-data";
import type {
  ExplorerCollection,
  MockResponse,
  RequestDraft,
  SavedRequest,
} from "./types";

function createDefaultDraft(request?: SavedRequest): RequestDraft {
  return {
    method: request?.method ?? "GET",
    url: request?.url ?? "https://jsonplaceholder.typicode.com/todos/1",
    headers: [
      { id: "h1", key: "Accept", value: "application/json", enabled: true },
      { id: "h2", key: "Content-Type", value: "application/json", enabled: true },
    ],
    queryParams: [{ id: "q1", key: "limit", value: "10", enabled: true }],
    body: DEFAULT_JSON_BODY,
    bearerToken: "",
  };
}

interface ApiExplorerProps {
  projectName: string;
  projectId: string;
}

export function ApiExplorer({ projectName, projectId }: ApiExplorerProps) {
  const [collections, setCollections] =
    useState<ExplorerCollection[]>(INITIAL_COLLECTIONS);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(
    INITIAL_COLLECTIONS[0]?.requests[0]?.id ?? null
  );
  const [draft, setDraft] = useState<RequestDraft>(() =>
    createDefaultDraft(INITIAL_COLLECTIONS[0]?.requests[0])
  );
  const [response, setResponse] = useState<MockResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const summary = useMemo(() => {
    return {
      method: draft.method,
      url: draft.url,
      status: response ? `${response.status} ${response.statusText}` : "—",
      duration: response ? `${response.timeMs} ms` : "—",
      size: response?.sizeLabel ?? "—",
    };
  }, [draft.method, draft.url, response]);

  function handleSelectRequest(request: SavedRequest) {
    setActiveRequestId(request.id);
    setDraft(createDefaultDraft(request));
    setResponse(null);
  }

  async function handleSend() {
    // TODO: Attach TraceFlow request tracing here.
    void projectId;
    setSending(true);
    setResponse(null);

    try {
      // Build URL with enabled query params
      let finalUrl = draft.url;
      const enabledParams = draft.queryParams.filter(
        (p) => p.enabled && p.key.trim() !== ""
      );
      if (enabledParams.length > 0) {
        const qs = new URLSearchParams(
          enabledParams.map((p) => [p.key, p.value])
        ).toString();
        String();
        finalUrl = `${draft.url}${draft.url.includes("?") ? "&" : "?"}${qs}`;
      }

      // Build headers object from enabled rows + optional bearer token
      const enabledHeaders: Record<string, string> = {};
      for (const h of draft.headers) {
        if (h.enabled && h.key.trim() !== "") {
          enabledHeaders[h.key] = h.value;
        }
      }
      if (draft.bearerToken.trim() !== "") {
        enabledHeaders["Authorization"] = `Bearer ${draft.bearerToken.trim()}`;
      }

      // Parse JSON body for applicable methods
      let requestBody: unknown = undefined;
      if (!["GET", "DELETE"].includes(draft.method) && draft.body.trim() !== "") {
        try {
          requestBody = JSON.parse(draft.body);
        } catch {
          requestBody = draft.body;
        }
      }

      const start = performance.now();

      const res = await axios({
        method: draft.method.toLowerCase(),
        url: finalUrl,
        headers: enabledHeaders,
        data: requestBody,
        validateStatus: () => true, // don't throw on non-2xx
        timeout: 30_000,
      });

      const duration = Math.round(performance.now() - start);

      // Approximate response size from JSON string
      const bodyStr = JSON.stringify(res.data);
      const sizeBytes = new TextEncoder().encode(bodyStr).length;
      const sizeLabel =
        sizeBytes < 1024
          ? `${sizeBytes} B`
          : `${(sizeBytes / 1024).toFixed(1)} KB`;

      // Normalise headers to Record<string, string>
      const responseHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(res.headers)) {
        if (typeof v === "string") responseHeaders[k] = v;
        else if (Array.isArray(v)) responseHeaders[k] = v.join(", ");
      }

      setResponse({
        status: res.status,
        statusText: res.statusText || String(res.status),
        timeMs: duration,
        sizeLabel,
        headers: responseHeaders,
        body: res.data,
      });
    } catch (err) {
      const duration = 0;
      if (err instanceof AxiosError) {
        if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
          setResponse({
            status: 0,
            statusText: err.code === "ECONNABORTED" ? "Request Timeout" : "Network Error",
            timeMs: duration,
            sizeLabel: "0 B",
            headers: {},
            body: { error: err.message },
          });
        } else {
          setResponse({
            status: err.response?.status ?? 0,
            statusText: err.response?.statusText ?? "Error",
            timeMs: duration,
            sizeLabel: "0 B",
            headers: {},
            body: { error: err.message },
          });
        }
      } else {
        setResponse({
          status: 0,
          statusText: "Unknown Error",
          timeMs: duration,
          sizeLabel: "0 B",
          headers: {},
          body: { error: String(err) },
        });
      }
    } finally {
      setSending(false);
    }
  }

  function handleSaveRequest() {
    // TODO: Persist collections and requests to backend for this projectId.
    void projectId;
    setSaving(true);

    const requestName = deriveRequestName(draft);
    const newRequestId = activeRequestId ?? `req-${Date.now()}`;

    if (!activeRequestId) {
      setActiveRequestId(newRequestId);
    }

    setCollections((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: `col-${Date.now()}`,
            name: "Saved Requests",
            expanded: true,
            requests: [
              {
                id: newRequestId,
                name: requestName,
                method: draft.method,
                url: draft.url,
              },
            ],
          },
        ];
      }

      if (activeRequestId) {
        return prev.map((collection) => ({
          ...collection,
          requests: collection.requests.map((request) =>
            request.id === activeRequestId
              ? {
                  ...request,
                  name: requestName,
                  method: draft.method,
                  url: draft.url,
                }
              : request
          ),
        }));
      }

      const [first, ...rest] = prev;
      return [
        {
          ...first,
          expanded: true,
          requests: [
            ...first.requests,
            {
              id: newRequestId,
              name: requestName,
              method: draft.method,
              url: draft.url,
            },
          ],
        },
        ...rest,
      ];
    });

    window.setTimeout(() => setSaving(false), 300);
  }

  function deriveRequestName(current: RequestDraft): string {
    try {
      const path = new URL(current.url).pathname;
      const segment = path.split("/").filter(Boolean).pop();
      if (segment) {
        return `${current.method} ${segment}`;
      }
    } catch {
      // invalid URL — fall back below
    }
    return `${current.method} Request`;
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] px-6 py-5">
        <Link
          href="/dashboard/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <div className="space-y-1">
          <h1 className="text-xl font-medium tracking-tight text-[var(--color-foreground)]">
            {projectName}
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">API Explorer</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <CollectionSidebar
          collections={collections}
          activeRequestId={activeRequestId}
          onSelectRequest={handleSelectRequest}
          onCollectionsChange={setCollections}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <RequestComposer
              draft={draft}
              onChange={setDraft}
              onSend={handleSend}
              onSave={handleSaveRequest}
              sending={sending}
              saving={saving}
            />
            <div className="min-h-[280px] flex-1">
              <ResponseViewer response={response} loading={sending} />
            </div>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
            <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
              <CardHeader>
                <CardTitle className="text-sm">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <SummaryRow label="Method" value={summary.method} />
                <SummaryRow label="URL" value={summary.url} mono />
                <Separator />
                <SummaryRow label="Status" value={summary.status} />
                <SummaryRow label="Duration" value={summary.duration} />
                <SummaryRow label="Response Size" value={summary.size} />
              </CardContent>
            </Card>
            <TracePlaceholder projectId={projectId} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p
        className={
          mono
            ? "break-all font-mono text-[var(--color-foreground)]"
            : "text-[var(--color-foreground)]"
        }
      >
        {value}
      </p>
    </div>
  );
}
