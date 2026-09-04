"use client";

import * as React from "react";
import type { GoalWithProgress } from "../goals.types";
import { useGoals } from "../hooks/use-goals";
import { GoalList } from "./goal-list";
import { GoalForm } from "./goal-form";
import { PageHeader } from "@/components/shared/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface GoalsViewProps {
  initialGoals: GoalWithProgress[];
}

export function GoalsView({ initialGoals }: GoalsViewProps) {
  const { goals, isPending, error, createGoal, updateProgress, deleteGoal } =
    useGoals(initialGoals);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Long-term milestones, targets, and progress tracking"
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + New Goal
          </Button>
        }
      />

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <GoalList
        goals={goals}
        onUpdateProgress={updateProgress}
        onDelete={deleteGoal}
        onAddNew={() => setIsCreateOpen(true)}
        isPending={isPending}
      />

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Goal"
        description="Set a measurable milestone with a target date."
      >
        <GoalForm
          onSubmit={async (data) => {
            const res = await createGoal(data);
            if (res?.success) {
              setIsCreateOpen(false);
            }
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isPending}
        />
      </Dialog>
    </div>
  );
}
