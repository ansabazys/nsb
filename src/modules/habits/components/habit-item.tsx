"use client";

import * as React from "react";
import type { HabitWithStreak } from "../habits.types";
import { HabitStreakBadge } from "./habit-streak";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface HabitItemProps {
  habit: HabitWithStreak;
  onToggle: (habitId: string, isCompleted: boolean) => void;
  onDelete?: (habitId: string) => void;
  isPending?: boolean;
}

export function HabitItem({
  habit,
  onToggle,
  onDelete,
  isPending = false,
}: HabitItemProps) {
  const isCompleted = habit.streak.isCompletedToday;

  return (
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-white">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(habit.id, isCompleted)}
          disabled={isPending}
          className="w-5 h-5 rounded border-neutral-300 text-neutral-900 cursor-pointer"
        />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-neutral-900">{habit.name}</h4>
            <Badge variant="outline">{habit.frequency}</Badge>
          </div>
          {habit.description && (
            <p className="text-xs text-neutral-500 mt-0.5">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <HabitStreakBadge streak={habit.streak} />
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(habit.id)}
            disabled={isPending}
            className="text-neutral-400 hover:text-red-600"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
