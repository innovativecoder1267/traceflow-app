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
  spans?: string[];
  createdAt: string;
  updatedAt?: string;
}
