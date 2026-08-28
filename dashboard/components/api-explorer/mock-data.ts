import type { ExplorerCollection, MockResponse } from "./types";

export const INITIAL_COLLECTIONS: ExplorerCollection[] = [
  {
    id: "col-users",
    name: "Users API",
    expanded: true,
    requests: [
      {
        id: "req-get-users",
        name: "GET Users",
        method: "GET",
        url: "https://example.com/api/users",
      },
      {
        id: "req-post-user",
        name: "POST User",
        method: "POST",
        url: "https://example.com/api/users",
      },
      {
        id: "req-delete-user",
        name: "DELETE User",
        method: "DELETE",
        url: "https://example.com/api/users/1",
      },
    ],
  },
];

export const DEFAULT_JSON_BODY = `{
  "name": "Jane Doe",
  "email": "jane@example.com"
}`;

/** TODO: Replace with real HTTP client + TraceFlow proxy when backend is ready. */
export function buildMockResponse(method: string, url: string): MockResponse {
  const isError = url.includes("error");

  if (isError) {
    return {
      status: 500,
      statusText: "Internal Server Error",
      timeMs: 214,
      sizeLabel: "0.8 KB",
      headers: {
        "content-type": "application/json",
        "x-request-id": "mock-req-error",
      },
      body: {
        error: "Something went wrong",
        message: "Mock error response for demonstration",
        method,
        path: url,
      },
    };
  }

  return {
    status: 200,
    statusText: "OK",
    timeMs: 143,
    sizeLabel: "2.4 KB",
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
      "x-request-id": "mock-req-success",
    },
    body: {
      data:
        method === "GET"
          ? [
              { id: "1", name: "Jane Doe", email: "jane@example.com" },
              { id: "2", name: "John Smith", email: "john@example.com" },
            ]
          : method === "DELETE"
            ? { deleted: true, id: "1" }
            : { id: "3", name: "Jane Doe", email: "jane@example.com" },
      meta: {
        mock: true,
        method,
        url,
      },
    },
  };
}
