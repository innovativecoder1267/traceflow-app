"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  FolderOpen,
  GitBranch,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Traces", href: "/dashboard/traces", icon: GitBranch },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[var(--color-primary)]">
            <Activity className="h-3.5 w-3.5 text-[var(--color-primary-foreground)]" />
          </div>
          <span className="font-semibold text-sm text-[var(--color-foreground)] tracking-tight">
            TraceFlow
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-accent)] text-[var(--color-foreground)] font-medium"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-background)] h-screen sticky top-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 z-50 flex flex-col w-64 h-full border-r border-[var(--color-border)] bg-[var(--color-background)] md:hidden">
            <SidebarContent pathname={pathname} onClose={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
