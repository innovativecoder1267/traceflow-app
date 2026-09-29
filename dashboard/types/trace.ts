export interface Span {
  name: string;
  type?: string;
  startedAt: string | number;
  endedAt?: string | number;
  duration: number;
  status?: "success" | "error";
  metadata?: Record<string, unknown>;
  error?: unknown;
}

export interface Trace {
  _id: string;
  projectId: string;
  id?: string;
  traceId?: string;
  method: string;
  route: string;
  path?: string;
  statusCode: number;
  startedAt: string;
  endedAt?: string;
  duration: number;
  status: "SUCCESS" | "ERROR";
  spans?: Span[];
  createdAt: string;
  updatedAt?: string;
}
