"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { HabitsService } from "./habits.service";
import type { CreateHabitInput, UpdateHabitInput, HabitWithStreak } from "./habits.types";
import type { ActionResult } from "@/types/actions.types";

export async function createHabitAction(
  input: CreateHabitInput
): Promise<ActionResult<HabitWithStreak>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);
    const result = await habitsService.createHabit(user.id, input);

    revalidatePath("/habits");
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
    console.error("[createHabitAction] Error creating habit:", error);
    let errorMessage =
      error instanceof Error ? error.message : "Failed to create habit";
    if (error && typeof error === "object" && "details" in error) {
      const details = (error as { details?: { code?: string; message?: string } }).details;
      if (
        details?.code === "PGRST205" ||
        details?.message?.includes("schema cache")
      ) {
        errorMessage =
          "Database tables not found. Please run the SQL migration in your Supabase SQL Editor: supabase/migrations/20260901000000_initial_nsb_schema.sql";
      } else if (details?.message) {
        errorMessage = `Database error: ${details.message}`;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateHabitAction(
  habitId: string,
  input: UpdateHabitInput
): Promise<ActionResult<HabitWithStreak>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);
    const result = await habitsService.updateHabit(habitId, user.id, input);

    revalidatePath("/habits");
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
      error: error instanceof Error ? error.message : "Failed to update habit",
    };
  }
}

export async function toggleHabitCompletionAction(
  habitId: string,
  isCurrentlyCompleted: boolean,
  completedDate?: string
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);

    if (isCurrentlyCompleted) {
      await habitsService.uncompleteHabit(habitId, user.id, completedDate);
      revalidatePath("/habits");
      revalidatePath("/dashboard");
      return { success: true, data: { completed: false } };
    } else {
      await habitsService.completeHabit(user.id, {
        habitId,
        completedDate,
      });
      revalidatePath("/habits");
      revalidatePath("/dashboard");
      return { success: true, data: { completed: true } };
    }
  } catch (error) {
    console.error("[toggleHabitCompletionAction] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update habit completion",
    };
  }
}

export async function deleteHabitAction(
  habitId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);
    await habitsService.deleteHabit(habitId, user.id);

    revalidatePath("/habits");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete habit",
    };
  }
}
