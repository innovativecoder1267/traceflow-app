import { randomBytes } from "crypto";

const CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateApiKey(): string {
  const bytes = randomBytes(24);
  const chars = Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join("");
  return `tf_live_${chars}`;
}

export function maskApiKey(key: string): string {
  if (key.length < 4) return "****";
  return `****${key.slice(-4)}`;
}
