import * as React from "react";
import type { HabitStreak } from "../habits.types";
import { Badge } from "@/components/ui/badge";

export interface HabitStreakBadgeProps {
  streak: HabitStreak;
}

export function HabitStreakBadge({ streak }: HabitStreakBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={streak.currentStreak > 0 ? "success" : "secondary"}>
        🔥 {streak.currentStreak} day{streak.currentStreak === 1 ? "" : "s"}
      </Badge>
      <span className="text-xs text-neutral-500">
        Best: {streak.longestStreak}
      </span>
    </div>
  );
}
