import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30",
        className
      )}
    >
      {icon && <div className="mb-3 text-neutral-500">{icon}</div>}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-neutral-400 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
