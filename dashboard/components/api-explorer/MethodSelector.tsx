"use client";

import { cn } from "@/lib/cn";
import type { HttpMethod } from "./types";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface MethodSelectorProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      className={cn(
        "h-9 min-w-[108px] rounded-md border border-[var(--color-border)] bg-[var(--color-input)] px-3 text-sm font-medium text-[var(--color-foreground)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ring)]"
      )}
    >
      {METHODS.map((method) => (
        <option key={method} value={method}>
          {method}
        </option>
      ))}
    </select>
  );
}
