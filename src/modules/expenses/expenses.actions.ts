"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { ExpensesService } from "./expenses.service";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseWithCategory,
  CreateExpenseCategoryInput,
  ExpenseCategory,
} from "./expenses.types";
import type { ActionResult } from "@/types/actions.types";

export async function createExpenseAction(
  input: CreateExpenseInput
): Promise<ActionResult<ExpenseWithCategory>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new ExpensesService(supabase);
    const result = await service.createExpense(user.id, input);

    revalidatePath("/expenses");
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
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function updateExpenseAction(
  expenseId: string,
  input: UpdateExpenseInput
): Promise<ActionResult<ExpenseWithCategory>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new ExpensesService(supabase);
    const result = await service.updateExpense(expenseId, user.id, input);

    revalidatePath("/expenses");
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
      error: error instanceof Error ? error.message : "Failed to update expense",
    };
  }
}

export async function deleteExpenseAction(
  expenseId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new ExpensesService(supabase);
    await service.deleteExpense(expenseId, user.id);

    revalidatePath("/expenses");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

export async function createExpenseCategoryAction(
  input: CreateExpenseCategoryInput
): Promise<ActionResult<ExpenseCategory>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new ExpensesService(supabase);
    const result = await service.createExpenseCategory(user.id, input);

    revalidatePath("/expenses");

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
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}
