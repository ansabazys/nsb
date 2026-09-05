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

export type HabitAccent =
  | "rose"
  | "sky"
  | "blue"
  | "amber"
  | "orange"
  | "purple"
  | "emerald";

export interface HabitWidgetItem {
  id: string;
  title: string;
  startTime: string; // "HH:MM" e.g. "07:45"
  endTime: string; // "HH:MM" e.g. "08:15"
  duration: string; // e.g. "30 min", "15 min"
  isCompleted: boolean;
  accentColor: HabitAccent | string;
  icon: string; // e.g. "workout", "shower", "coffee", "mail"
  hourMarker?: string | null;
}
