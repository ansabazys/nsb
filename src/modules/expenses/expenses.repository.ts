import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  Expense,
  ExpenseWithCategory,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateExpenseCategoryInput,
} from "./expenses.types";
import { DatabaseError } from "@/lib/errors/app-error";

export class ExpensesRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private mapCategoryRow(
    row: Database["public"]["Tables"]["expense_categories"]["Row"]
  ): ExpenseCategory {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      isSystem: row.is_system,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapExpenseRow(row: Database["public"]["Tables"]["expenses"]["Row"]): Expense {
    return {
      id: row.id,
      userId: row.user_id,
      expenseCategoryId: row.expense_category_id,
      amount: Number(row.amount),
      currency: row.currency,
      date: row.date,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findCategoryById(
    categoryId: string,
    userId: string
  ): Promise<ExpenseCategory | null> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .select("*")
      .eq("id", categoryId)
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to find expense category.", error);
    }

    return this.mapCategoryRow(data);
  }

  async findAllCategories(userId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .select("*")
      .or(`user_id.eq.${userId},is_system.eq.true`)
      .order("name", { ascending: true });

    if (error) {
      throw new DatabaseError("Failed to fetch expense categories.", error);
    }

    return data.map((row) => this.mapCategoryRow(row));
  }

  async createCategory(
    userId: string,
    input: CreateExpenseCategoryInput
  ): Promise<ExpenseCategory> {
    const { data, error } = await this.supabase
      .from("expense_categories")
      .insert({
        user_id: userId,
        name: input.name,
        icon: input.icon ?? null,
        color: input.color ?? null,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create expense category.", error);
    }

    return this.mapCategoryRow(data);
  }

  async findExpenseById(
    expenseId: string,
    userId: string
  ): Promise<ExpenseWithCategory | null> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*, expense_categories(*)")
      .eq("id", expenseId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to find expense by id.", error);
    }

    const categoryRow = data.expense_categories as unknown as Database["public"]["Tables"]["expense_categories"]["Row"];

    return {
      ...this.mapExpenseRow(data),
      category: this.mapCategoryRow(categoryRow),
    };
  }

  async findExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ExpenseWithCategory[]> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*, expense_categories(*)")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      throw new DatabaseError("Failed to fetch expenses by date range.", error);
    }

    return data.map((row) => {
      const categoryRow = row.expense_categories as unknown as Database["public"]["Tables"]["expense_categories"]["Row"];
      return {
        ...this.mapExpenseRow(row),
        category: this.mapCategoryRow(categoryRow),
      };
    });
  }

  async findExpensesForDate(userId: string, date: string): Promise<ExpenseWithCategory[]> {
    return this.findExpensesByDateRange(userId, date, date);
  }

  async createExpense(
    userId: string,
    input: CreateExpenseInput
  ): Promise<ExpenseWithCategory> {
    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        user_id: userId,
        expense_category_id: input.expenseCategoryId,
        amount: input.amount,
        currency: input.currency ?? "USD",
        date: input.date ?? new Date().toISOString().split("T")[0],
        description: input.description ?? null,
      })
      .select("*, expense_categories(*)")
      .single();

    if (error) {
      throw new DatabaseError("Failed to create expense.", error);
    }

    const categoryRow = data.expense_categories as unknown as Database["public"]["Tables"]["expense_categories"]["Row"];

    return {
      ...this.mapExpenseRow(data),
      category: this.mapCategoryRow(categoryRow),
    };
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    input: UpdateExpenseInput
  ): Promise<ExpenseWithCategory | null> {
    const updatePayload: Database["public"]["Tables"]["expenses"]["Update"] = {};

    if (input.expenseCategoryId !== undefined)
      updatePayload.expense_category_id = input.expenseCategoryId;
    if (input.amount !== undefined) updatePayload.amount = input.amount;
    if (input.currency !== undefined) updatePayload.currency = input.currency;
    if (input.date !== undefined) updatePayload.date = input.date;
    if (input.description !== undefined) updatePayload.description = input.description;

    const { data, error } = await this.supabase
      .from("expenses")
      .update(updatePayload)
      .eq("id", expenseId)
      .eq("user_id", userId)
      .select("*, expense_categories(*)")
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to update expense.", error);
    }

    const categoryRow = data.expense_categories as unknown as Database["public"]["Tables"]["expense_categories"]["Row"];

    return {
      ...this.mapExpenseRow(data),
      category: this.mapCategoryRow(categoryRow),
    };
  }

  async deleteExpense(expenseId: string, userId: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("expenses")
      .delete({ count: "exact" })
      .eq("id", expenseId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError("Failed to delete expense.", error);
    }

    return (count ?? 0) > 0;
  }
}
