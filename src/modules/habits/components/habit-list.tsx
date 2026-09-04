"use client";

import * as React from "react";
import type { HabitWithStreak } from "../habits.types";
import { HabitItem } from "./habit-item";
import { EmptyState } from "@/components/shared/empty-state";

export interface HabitListProps {
  habits: HabitWithStreak[];
  onToggle: (habitId: string, isCompleted: boolean) => void;
  onDelete?: (habitId: string) => void;
  onAddNew?: () => void;
  isPending?: boolean;
}

export function HabitList({
  habits,
  onToggle,
  onDelete,
  onAddNew,
  isPending,
}: HabitListProps) {
  if (habits.length === 0) {
    return (
      <EmptyState
        title="No habits found"
        description="Start building consistent daily rituals by creating your first habit."
        action={
          onAddNew && (
            <button
              onClick={onAddNew}
              className="text-xs font-semibold text-neutral-900 underline"
            >
              Add a habit
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitItem
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          onDelete={onDelete}
          isPending={isPending}
        />
      ))}
    </div>
  );
}
