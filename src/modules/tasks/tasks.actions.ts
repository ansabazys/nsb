"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { TasksService } from "./tasks.service";
import type { Task, CreateTaskInput, UpdateTaskInput } from "./tasks.types";
import type { ActionResult } from "@/types/actions.types";

export async function createTaskAction(
  input: CreateTaskInput
): Promise<ActionResult<Task>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new TasksService(supabase);
    const result = await service.createTask(user.id, input);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput
): Promise<ActionResult<Task>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new TasksService(supabase);
    const result = await service.updateTask(taskId, user.id, input);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function toggleTaskStatusAction(
  taskId: string,
  currentStatus: Task["status"]
): Promise<ActionResult<Task>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new TasksService(supabase);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const result = await service.setTaskStatus(taskId, user.id, newStatus);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle task",
    };
  }
}

export async function deleteTaskAction(
  taskId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new TasksService(supabase);
    await service.deleteTask(taskId, user.id);

    revalidatePath("/tasks");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
