import { Activity } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Brand Panel */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-[var(--color-card)] border-r border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--color-primary)]">
            <Activity className="h-4 w-4 text-[var(--color-primary-foreground)]" />
          </div>
          <span className="font-semibold text-[var(--color-foreground)] tracking-tight">
            TraceFlow
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed max-w-xs">
            Full-stack observability for modern applications. Trace every
            request, understand every failure.
          </p>
          <div className="flex flex-col gap-2">
            {[
              "Distributed trace collection",
              "Real-time SDK integration",
              "Project-level API key management",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--color-success)]" />
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted-foreground)]">
          &copy; {new Date().getFullYear()} TraceFlow
        </p>
      </div>

      {/* Form Column */}
      <div className="flex items-center justify-center p-8 bg-[var(--color-background)]">
        {children}
      </div>
    </div>
  );
}
