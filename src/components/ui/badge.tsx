import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
        variant === "default" && "bg-white text-black",
        variant === "secondary" && "bg-neutral-800 text-neutral-200",
        variant === "outline" && "border border-neutral-700 text-neutral-300",
        variant === "success" && "bg-emerald-950/60 border border-emerald-800/60 text-emerald-400",
        variant === "warning" && "bg-amber-950/60 border border-amber-800/60 text-amber-400",
        variant === "danger" && "bg-red-950/60 border border-red-800/60 text-red-400",
        className
      )}
      {...props}
    />
  );
}
