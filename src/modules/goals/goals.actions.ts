"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { GoalsService } from "./goals.service";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  UpdateGoalProgressInput,
  GoalWithProgress,
} from "./goals.types";
import type { ActionResult } from "@/types/actions.types";

export async function createGoalAction(
  input: CreateGoalInput
): Promise<ActionResult<GoalWithProgress>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new GoalsService(supabase);
    const result = await service.createGoal(user.id, input);

    revalidatePath("/goals");
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
      error: error instanceof Error ? error.message : "Failed to create goal",
    };
  }
}

export async function updateGoalAction(
  goalId: string,
  input: UpdateGoalInput
): Promise<ActionResult<GoalWithProgress>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new GoalsService(supabase);
    const result = await service.updateGoal(goalId, user.id, input);

    revalidatePath("/goals");
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
      error: error instanceof Error ? error.message : "Failed to update goal",
    };
  }
}

export async function updateGoalProgressAction(
  goalId: string,
  input: UpdateGoalProgressInput
): Promise<ActionResult<GoalWithProgress>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new GoalsService(supabase);
    const result = await service.updateProgress(goalId, user.id, input);

    revalidatePath("/goals");
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
      error: error instanceof Error ? error.message : "Failed to update goal progress",
    };
  }
}

export async function deleteGoalAction(
  goalId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new GoalsService(supabase);
    await service.deleteGoal(goalId, user.id);

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete goal",
    };
  }
}
