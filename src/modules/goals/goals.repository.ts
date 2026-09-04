import type { Database, AppSupabaseClient, GoalStatus } from "@/types/database.types";
import type { Goal, CreateGoalInput, UpdateGoalInput } from "./goals.types";
import { DatabaseError } from "@/lib/errors/app-error";

export class GoalsRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  private mapGoalRow(row: Database["public"]["Tables"]["goals"]["Row"]): Goal {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      targetValue: Number(row.target_value),
      currentValue: Number(row.current_value),
      unit: row.unit,
      deadline: row.deadline,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(goalId: string, userId: string): Promise<Goal | null> {
    const { data, error } = await this.supabase
      .from("goals")
      .select("*")
      .eq("id", goalId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to find goal by id.", error);
    }

    return this.mapGoalRow(data);
  }

  async findAllByUser(userId: string, statusFilter?: GoalStatus): Promise<Goal[]> {
    let query = this.supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError("Failed to fetch goals for user.", error);
    }

    return data.map((row) => this.mapGoalRow(row));
  }

  async create(userId: string, input: CreateGoalInput): Promise<Goal> {
    const { data, error } = await this.supabase
      .from("goals")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description ?? null,
        target_value: input.targetValue,
        current_value: input.currentValue ?? 0,
        unit: input.unit ?? null,
        deadline: input.deadline ?? null,
        status: input.status ?? "not_started",
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create goal.", error);
    }

    return this.mapGoalRow(data);
  }

  async update(goalId: string, userId: string, input: UpdateGoalInput): Promise<Goal | null> {
    const updatePayload: Database["public"]["Tables"]["goals"]["Update"] = {};

    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.targetValue !== undefined) updatePayload.target_value = input.targetValue;
    if (input.currentValue !== undefined) updatePayload.current_value = input.currentValue;
    if (input.unit !== undefined) updatePayload.unit = input.unit;
    if (input.deadline !== undefined) updatePayload.deadline = input.deadline;
    if (input.status !== undefined) updatePayload.status = input.status;

    const { data, error } = await this.supabase
      .from("goals")
      .update(updatePayload)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to update goal.", error);
    }

    return this.mapGoalRow(data);
  }

  async delete(goalId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("goals")
      .delete({ count: "exact" })
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError("Failed to delete goal.", error);
    }

    return (count ?? 0) > 0;
  }
}
