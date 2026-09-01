import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilterOptions } from "./tasks.types";
import { DatabaseError } from "@/lib/errors/app-error";

export class TasksRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private mapTaskRow(row: Database["public"]["Tables"]["tasks"]["Row"]): Task {
    return {
      id: row.id,
      userId: row.user_id,
      goalId: row.goal_id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findById(taskId: string, userId: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to find task by id.", error);
    }

    return this.mapTaskRow(data);
  }

  async findAllByUser(userId: string, filters?: TaskFilterOptions): Promise<Task[]> {
    let query = this.supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters?.goalId) {
      query = query.eq("goal_id", filters.goalId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      throw new DatabaseError("Failed to fetch tasks for user.", error);
    }

    return data.map((row) => this.mapTaskRow(row));
  }

  async create(userId: string, input: CreateTaskInput): Promise<Task> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert({
        user_id: userId,
        goal_id: input.goalId ?? null,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "pending",
        priority: input.priority ?? "medium",
        due_date: input.dueDate ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create task.", error);
    }

    return this.mapTaskRow(data);
  }

  async update(taskId: string, userId: string, input: UpdateTaskInput): Promise<Task | null> {
    const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {};

    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.goalId !== undefined) updatePayload.goal_id = input.goalId;
    if (input.status !== undefined) updatePayload.status = input.status;
    if (input.priority !== undefined) updatePayload.priority = input.priority;
    if (input.dueDate !== undefined) updatePayload.due_date = input.dueDate;

    const { data, error } = await this.supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to update task.", error);
    }

    return this.mapTaskRow(data);
  }

  async delete(taskId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("tasks")
      .delete({ count: "exact" })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError("Failed to delete task.", error);
    }

    return (count ?? 0) > 0;
  }
}
