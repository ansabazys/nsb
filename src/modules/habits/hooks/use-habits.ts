"use client";

import { useState, useTransition } from "react";
import type { HabitWithStreak, CreateHabitInput } from "../habits.types";
import {
  createHabitAction,
  toggleHabitCompletionAction,
  deleteHabitAction,
} from "../habits.actions";

export function useHabits(initialHabits: HabitWithStreak[] = []) {
  const [habits, setHabits] = useState<HabitWithStreak[]>(initialHabits);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleHabit = (habitId: string, isCurrentlyCompleted: boolean) => {
    setError(null);
    startTransition(async () => {
      // Optimistic update
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                streak: {
                  ...h.streak,
                  isCompletedToday: !isCurrentlyCompleted,
                  currentStreak: !isCurrentlyCompleted
                    ? h.streak.currentStreak + 1
                    : Math.max(0, h.streak.currentStreak - 1),
                },
              }
            : h
        )
      );

      const res = await toggleHabitCompletionAction(habitId, isCurrentlyCompleted);
      if (!res.success) {
        setError(res.error);
        // Rollback on error
        setHabits(initialHabits);
      }
    });
  };

  const createHabit = async (input: CreateHabitInput) => {
    setError(null);
    const res = await createHabitAction(input);
    if (!res.success) {
      setError(res.error);
      return res;
    }
    setHabits((prev) => [res.data, ...prev]);
    return res;
  };

  const deleteHabit = (habitId: string) => {
    setError(null);
    startTransition(async () => {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      const res = await deleteHabitAction(habitId);
      if (!res.success) {
        setError(res.error);
        setHabits(initialHabits);
      }
    });
  };

  return {
    habits,
    isPending,
    error,
    toggleHabit,
    createHabit,
    deleteHabit,
  };
}
