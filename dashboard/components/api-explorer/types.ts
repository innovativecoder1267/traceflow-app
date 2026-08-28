export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface KeyValueRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
}

export interface ExplorerCollection {
  id: string;
  name: string;
  expanded: boolean;
  requests: SavedRequest[];
}

export interface MockResponse {
  status: number;
  statusText: string;
  timeMs: number;
  sizeLabel: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface RequestDraft {
  method: HttpMethod;
  url: string;
  headers: KeyValueRow[];
  queryParams: KeyValueRow[];
  body: string;
  bearerToken: string;
}
