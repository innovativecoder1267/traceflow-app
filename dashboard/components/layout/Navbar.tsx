"use client";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenDrawer: () => void;
}

export function Navbar({ onOpenDrawer }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm gap-4">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onOpenDrawer}
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search…"
            readOnly
            className="w-full h-8 pl-8 pr-3 text-sm bg-[var(--color-muted)] border border-[var(--color-border)] rounded-md text-[var(--color-muted-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none cursor-default"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-[var(--color-muted)] border border-[var(--color-border)] flex items-center justify-center ml-1">
          <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
            U
          </span>
        </div>
      </div>
    </header>
  );
}
