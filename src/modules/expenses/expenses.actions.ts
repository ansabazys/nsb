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

export interface CreateTransactionActionInput {
  type: "income" | "expense";
  amount: number;
  expenseCategoryId?: string;
  currency?: string;
  date?: string;
  description?: string | null;
}

export async function createTransactionAction(
  input: CreateTransactionActionInput
): Promise<ActionResult<ExpenseWithCategory>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new ExpensesService(supabase);

    let categoryId = input.expenseCategoryId;

    if (!categoryId) {
      const categories = await service.getExpenseCategories(user.id);
      if (input.type === "income") {
        const incomeCat = categories.find(
          (c) =>
            c.name.toLowerCase() === "income" ||
            c.name.toLowerCase().includes("salary") ||
            c.name.toLowerCase().includes("freelance")
        );
        if (incomeCat) {
          categoryId = incomeCat.id;
        } else {
          const newCat = await service.createExpenseCategory(user.id, {
            name: "Income",
            color: "#10B981",
            icon: "TrendingUp",
          });
          categoryId = newCat.id;
        }
      } else {
        const expenseCat = categories.find(
          (c) =>
            !c.name.toLowerCase().includes("income") &&
            !c.name.toLowerCase().includes("salary")
        );
        categoryId = expenseCat?.id || categories[0]?.id;
      }
    }

    if (!categoryId) {
      return {
        success: false,
        error: "No valid category found for transaction.",
      };
    }

    let description = input.description?.trim() || null;
    if (input.type === "income") {
      if (!description) {
        description = "[INCOME] Income";
      } else if (!description.toLowerCase().startsWith("[income]")) {
        description = `[INCOME] ${description}`;
      }
    }

    const expenseInput: CreateExpenseInput = {
      expenseCategoryId: categoryId,
      amount: input.amount,
      currency: input.currency ?? "INR",
      date: input.date,
      description,
    };

    const result = await service.createExpense(user.id, expenseInput);

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
      error: error instanceof Error ? error.message : "Failed to record transaction",
    };
  }
}
