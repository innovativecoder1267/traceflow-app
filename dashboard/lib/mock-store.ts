import type { Project } from "@/types/project";

// Singleton store — survives Next.js hot-reloads via globalThis
const g = globalThis as typeof globalThis & { __mockProjects?: Project[] };
if (!g.__mockProjects) g.__mockProjects = [];
const store = g.__mockProjects;

export function findAll(): Project[] {
  return [...store];
}

export function findById(id: string): Project | undefined {
  return store.find((p) => p._id === id);
}

export function create(project: Project): Project {
  store.push(project);
  return project;
}
