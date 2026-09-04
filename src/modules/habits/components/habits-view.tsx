"use client";

import * as React from "react";
import type { HabitWithStreak } from "../habits.types";
import { useHabits } from "../hooks/use-habits";
import { HabitList } from "./habit-list";
import { HabitForm } from "./habit-form";
import { PageHeader } from "@/components/shared/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface HabitsViewProps {
  initialHabits: HabitWithStreak[];
}

export function HabitsView({ initialHabits }: HabitsViewProps) {
  const { habits, isPending, error, toggleHabit, createHabit, deleteHabit } =
    useHabits(initialHabits);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="Daily rituals and streak tracking"
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + New Habit
          </Button>
        }
      />

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <HabitList
        habits={habits}
        onToggle={toggleHabit}
        onDelete={deleteHabit}
        onAddNew={() => setIsCreateOpen(true)}
        isPending={isPending}
      />

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Habit"
        description="Define a new ritual to track daily or weekly."
      >
        <HabitForm
          onSubmit={async (data) => {
            const res = await createHabit(data);
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
