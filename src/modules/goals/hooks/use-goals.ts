"use client";

import { useState, useTransition } from "react";
import type { GoalWithProgress, CreateGoalInput } from "../goals.types";
import {
  createGoalAction,
  updateGoalProgressAction,
  deleteGoalAction,
} from "../goals.actions";

export function useGoals(initialGoals: GoalWithProgress[] = []) {
  const [goals, setGoals] = useState<GoalWithProgress[]>(initialGoals);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const createGoal = async (input: CreateGoalInput) => {
    setError(null);
    const res = await createGoalAction(input);
    if (!res.success) {
      setError(res.error);
      return res;
    }
    setGoals((prev) => [res.data, ...prev]);
    return res;
  };

  const updateProgress = (goalId: string, currentValue: number) => {
    setError(null);
    startTransition(async () => {
      const res = await updateGoalProgressAction(goalId, { currentValue });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? res.data : g))
      );
    });
  };

  const deleteGoal = (goalId: string) => {
    setError(null);
    startTransition(async () => {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      const res = await deleteGoalAction(goalId);
      if (!res.success) {
        setError(res.error);
        setGoals(initialGoals);
      }
    });
  };

  return {
    goals,
    isPending,
    error,
    createGoal,
    updateProgress,
    deleteGoal,
  };
}
