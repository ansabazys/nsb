import * as React from "react";
import type { GoalProgressMetrics } from "../goals.types";

export interface GoalProgressBarProps {
  progress: GoalProgressMetrics;
}

export function GoalProgressBar({ progress }: GoalProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress.percentage));

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-medium text-neutral-600">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-neutral-900 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
