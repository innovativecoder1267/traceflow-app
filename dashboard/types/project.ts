export interface Project {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  ownerId?: string;
  apiKey?: string;
  status: "ACTIVE" | "REVOKED";
}
