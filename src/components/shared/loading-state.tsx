import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center text-neutral-400",
        className
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mb-3" />
      <p className="text-xs font-medium tracking-wide">{message}</p>
    </div>
  );
}
