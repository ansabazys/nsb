import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryAction?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this data.",
  retryAction,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-900/60 bg-red-950/30 text-red-300",
        className
      )}
    >
      <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-neutral-400 max-w-sm leading-relaxed">{message}</p>
      {retryAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={retryAction}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
