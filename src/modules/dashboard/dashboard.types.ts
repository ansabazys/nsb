import type { HabitWithStreak } from "@/modules/habits/habits.types";
import type { Task } from "@/modules/tasks/tasks.types";
import type { ExpenseWithCategory } from "@/modules/expenses/expenses.types";
import type { GoalWithProgress } from "@/modules/goals/goals.types";

export interface DailyHabitsSummary {
  habits: HabitWithStreak[];
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
}

export interface DailyTasksSummary {
  tasks: Task[];
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

export interface DailyExpensesSummary {
  expenses: ExpenseWithCategory[];
  totalAmount: number;
  transactionCount: number;
}

export interface GoalsSummary {
  goals: GoalWithProgress[];
  totalActiveCount: number;
  averageProgressPercentage: number;
}

export interface DashboardTodaySummary {
  date: string; // YYYY-MM-DD
  habits: DailyHabitsSummary;
  tasks: DailyTasksSummary;
  expenses: DailyExpensesSummary;
  goals: GoalsSummary;
  overallScore: number; // 0 - 100 aggregate day productivity score
}
