import * as React from "react";
import { cn } from "@/lib/cn";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      "shrink-0 bg-[var(--color-border)]",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
