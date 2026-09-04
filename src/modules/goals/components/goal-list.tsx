"use client";

import * as React from "react";
import type { GoalWithProgress } from "../goals.types";
import { GoalCard } from "./goal-card";
import { EmptyState } from "@/components/shared/empty-state";

export interface GoalListProps {
  goals: GoalWithProgress[];
  onUpdateProgress?: (goalId: string, currentVal: number) => void;
  onDelete?: (goalId: string) => void;
  onAddNew?: () => void;
  isPending?: boolean;
}

export function GoalList({
  goals,
  onUpdateProgress,
  onDelete,
  onAddNew,
  isPending,
}: GoalListProps) {
  if (goals.length === 0) {
    return (
      <EmptyState
        title="No goals set"
        description="Define meaningful milestones and long-term targets to stay on track."
        action={
          onAddNew && (
            <button
              onClick={onAddNew}
              className="text-xs font-semibold text-neutral-900 underline"
            >
              Create a goal
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onUpdateProgress={onUpdateProgress}
          onDelete={onDelete}
          isPending={isPending}
        />
      ))}
    </div>
  );
}
