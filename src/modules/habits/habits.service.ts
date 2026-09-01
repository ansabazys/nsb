import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { HabitsRepository } from "./habits.repository";
import {
  CreateHabitSchema,
  UpdateHabitSchema,
  LogHabitCompletionSchema,
  HabitIdSchema,
} from "./habits.schema";
import {
  HabitNotFoundError,
  HabitArchivedError,
  HabitCompletionConflictError,
} from "./habits.errors";
import { calculateHabitStreak } from "./habits.utils";
import { getTodayDateString } from "@/lib/utils/date.utils";
import type {
  Habit,
  HabitWithStreak,
  HabitCompletion,
  CreateHabitInput,
  UpdateHabitInput,
  LogHabitCompletionInput,
} from "./habits.types";

export class HabitsService {
  private readonly repository: HabitsRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new HabitsRepository(supabase);
  }

  async getHabitById(habitId: string, userId: string): Promise<HabitWithStreak> {
    HabitIdSchema.parse(habitId);
    const habit = await this.repository.findById(habitId, userId);
    if (!habit) {
      throw new HabitNotFoundError(habitId);
    }

    const completions = await this.repository.findCompletionsByHabit(habitId, userId);
    const streak = calculateHabitStreak(
      completions.map((c) => c.completedDate),
      habit.createdAt
    );

    return {
      ...habit,
      streak,
    };
  }

  async getUserHabits(userId: string, includeArchived = false): Promise<HabitWithStreak[]> {
    const habits = await this.repository.findAllByUser(userId, includeArchived);

    const habitsWithStreaks = await Promise.all(
      habits.map(async (habit) => {
        const completions = await this.repository.findCompletionsByHabit(habit.id, userId);
        const streak = calculateHabitStreak(
          completions.map((c) => c.completedDate),
          habit.createdAt
        );
        return {
          ...habit,
          streak,
        };
      })
    );

    return habitsWithStreaks;
  }

  async getTodayHabits(userId: string): Promise<{
    habits: HabitWithStreak[];
    totalCount: number;
    completedCount: number;
    completionPercentage: number;
  }> {
    const activeHabits = await this.getUserHabits(userId, false);
    const completedHabits = activeHabits.filter((h) => h.streak.isCompletedToday);

    const totalCount = activeHabits.length;
    const completedCount = completedHabits.length;
    const completionPercentage =
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
      habits: activeHabits,
      totalCount,
      completedCount,
      completionPercentage,
    };
  }

  async createHabit(userId: string, rawInput: CreateHabitInput): Promise<HabitWithStreak> {
    const validated = CreateHabitSchema.parse(rawInput);
    const habit = await this.repository.create(userId, validated);
    const streak = calculateHabitStreak([], habit.createdAt);

    return {
      ...habit,
      streak,
    };
  }

  async updateHabit(
    habitId: string,
    userId: string,
    rawInput: UpdateHabitInput
  ): Promise<HabitWithStreak> {
    HabitIdSchema.parse(habitId);
    const validated = UpdateHabitSchema.parse(rawInput);

    const existing = await this.repository.findById(habitId, userId);
    if (!existing) {
      throw new HabitNotFoundError(habitId);
    }

    const updated = await this.repository.update(habitId, userId, validated);
    if (!updated) {
      throw new HabitNotFoundError(habitId);
    }

    const completions = await this.repository.findCompletionsByHabit(habitId, userId);
    const streak = calculateHabitStreak(
      completions.map((c) => c.completedDate),
      updated.createdAt
    );

    return {
      ...updated,
      streak,
    };
  }

  async archiveHabit(habitId: string, userId: string): Promise<Habit> {
    return (await this.updateHabit(habitId, userId, { isArchived: true })) as Habit;
  }

  async deleteHabit(habitId: string, userId: string): Promise<boolean> {
    HabitIdSchema.parse(habitId);
    const existing = await this.repository.findById(habitId, userId);
    if (!existing) {
      throw new HabitNotFoundError(habitId);
    }
    return await this.repository.delete(habitId, userId);
  }

  async completeHabit(
    userId: string,
    rawInput: LogHabitCompletionInput
  ): Promise<HabitCompletion> {
    const validated = LogHabitCompletionSchema.parse(rawInput);
    const dateToLog = validated.completedDate ?? getTodayDateString();

    const habit = await this.repository.findById(validated.habitId, userId);
    if (!habit) {
      throw new HabitNotFoundError(validated.habitId);
    }

    if (habit.isArchived) {
      throw new HabitArchivedError(validated.habitId);
    }

    try {
      return await this.repository.logCompletion(
        validated.habitId,
        userId,
        dateToLog,
        validated.notes
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("already completed")) {
        throw new HabitCompletionConflictError(validated.habitId, dateToLog);
      }
      throw error;
    }
  }

  async uncompleteHabit(
    habitId: string,
    userId: string,
    completedDate: string = getTodayDateString()
  ): Promise<boolean> {
    HabitIdSchema.parse(habitId);
    const habit = await this.repository.findById(habitId, userId);
    if (!habit) {
      throw new HabitNotFoundError(habitId);
    }

    return await this.repository.removeCompletion(habitId, userId, completedDate);
  }
}
