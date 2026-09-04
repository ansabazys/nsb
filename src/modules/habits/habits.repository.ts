import type { Database, AppSupabaseClient } from "@/types/database.types";
import type { Habit, HabitCompletion, CreateHabitInput, UpdateHabitInput } from "./habits.types";
import { DatabaseError } from "@/lib/errors/app-error";

export class HabitsRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  private mapHabitRow(row: Database["public"]["Tables"]["habits"]["Row"]): Habit {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      frequency: row.frequency,
      targetPerPeriod: row.target_per_period,
      isArchived: row.is_archived,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCompletionRow(
    row: Database["public"]["Tables"]["habit_completions"]["Row"]
  ): HabitCompletion {
    return {
      id: row.id,
      habitId: row.habit_id,
      userId: row.user_id,
      completedDate: row.completed_date,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  async findById(habitId: string, userId: string): Promise<Habit | null> {
    const { data, error } = await this.supabase
      .from("habits")
      .select("*")
      .eq("id", habitId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw new DatabaseError("Failed to find habit by id.", error);
    }

    return this.mapHabitRow(data);
  }

  async findAllByUser(userId: string, includeArchived = false): Promise<Habit[]> {
    let query = this.supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError("Failed to fetch habits for user.", error);
    }

    return data.map((row) => this.mapHabitRow(row));
  }

  async create(userId: string, input: CreateHabitInput): Promise<Habit> {
    const { data, error } = await this.supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        frequency: input.frequency ?? "daily",
        target_per_period: input.targetPerPeriod ?? 1,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create habit.", error);
    }

    return this.mapHabitRow(data);
  }

  async update(habitId: string, userId: string, input: UpdateHabitInput): Promise<Habit | null> {
    const updatePayload: Database["public"]["Tables"]["habits"]["Update"] = {};

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.frequency !== undefined) updatePayload.frequency = input.frequency;
    if (input.targetPerPeriod !== undefined) updatePayload.target_per_period = input.targetPerPeriod;
    if (input.isArchived !== undefined) updatePayload.is_archived = input.isArchived;

    const { data, error } = await this.supabase
      .from("habits")
      .update(updatePayload)
      .eq("id", habitId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to update habit.", error);
    }

    return this.mapHabitRow(data);
  }

  async delete(habitId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("habits")
      .delete({ count: "exact" })
      .eq("id", habitId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError("Failed to delete habit.", error);
    }

    return (count ?? 0) > 0;
  }

  async findCompletionsByHabit(habitId: string, userId: string): Promise<HabitCompletion[]> {
    const { data, error } = await this.supabase
      .from("habit_completions")
      .select("*")
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .order("completed_date", { ascending: true });

    if (error) {
      throw new DatabaseError("Failed to fetch habit completions.", error);
    }

    return data.map((row) => this.mapCompletionRow(row));
  }

  async findCompletionsForUserDate(userId: string, date: string): Promise<HabitCompletion[]> {
    const { data, error } = await this.supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("completed_date", date);

    if (error) {
      throw new DatabaseError("Failed to fetch completions for user date.", error);
    }

    return data.map((row) => this.mapCompletionRow(row));
  }

  async logCompletion(
    habitId: string,
    userId: string,
    completedDate: string,
    notes?: string | null
  ): Promise<HabitCompletion> {
    const { data, error } = await this.supabase
      .from("habit_completions")
      .insert({
        habit_id: habitId,
        user_id: userId,
        completed_date: completedDate,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new DatabaseError("Habit already completed for this date.", error);
      }
      throw new DatabaseError("Failed to log habit completion.", error);
    }

    return this.mapCompletionRow(data);
  }

  async removeCompletion(habitId: string, userId: string, completedDate: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("habit_completions")
      .delete({ count: "exact" })
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("completed_date", completedDate);

    if (error) {
      throw new DatabaseError("Failed to remove habit completion.", error);
    }

    return (count ?? 0) > 0;
  }
}
