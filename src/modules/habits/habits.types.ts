import type { HabitFrequency } from "@/types/database.types";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  targetPerPeriod: number;
  scheduleWeekdays: number[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedDate: string; // YYYY-MM-DD
  notes: string | null;
  createdAt: string;
}

export interface HabitStreak {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isCompletedToday: boolean;
  completionRate: number; // percentage 0 - 100
  lastCompletedDate: string | null;
}

export interface HabitWithStreak extends Habit {
  streak: HabitStreak;
}

export interface CreateHabitInput {
  name: string;
  description?: string | null;
  frequency?: HabitFrequency;
  targetPerPeriod?: number;
  scheduleWeekdays?: number[];
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  frequency?: HabitFrequency;
  targetPerPeriod?: number;
  scheduleWeekdays?: number[];
  isArchived?: boolean;
}

export interface LogHabitCompletionInput {
  habitId: string;
  completedDate?: string; // defaults to today (YYYY-MM-DD)
  notes?: string | null;
}
