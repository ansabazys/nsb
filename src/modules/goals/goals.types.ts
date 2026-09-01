import type { GoalStatus } from "@/types/database.types";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  deadline: string | null; // YYYY-MM-DD
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgressMetrics {
  percentage: number; // 0 - 100+
  remainingValue: number;
  isCompleted: boolean;
  daysRemaining: number | null;
  isOverdue: boolean;
}

export interface GoalWithProgress extends Goal {
  progress: GoalProgressMetrics;
}

export interface CreateGoalInput {
  name: string;
  description?: string | null;
  targetValue: number;
  currentValue?: number;
  unit?: string | null;
  deadline?: string | null;
  status?: GoalStatus;
}

export interface UpdateGoalInput {
  name?: string;
  description?: string | null;
  targetValue?: number;
  currentValue?: number;
  unit?: string | null;
  deadline?: string | null;
  status?: GoalStatus;
}

export interface UpdateGoalProgressInput {
  currentValue: number;
}
