import type { AppSupabaseClient } from "@/types/database.types";
import { ExpensesRepository } from "./expenses.repository";
import {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  CreateExpenseCategorySchema,
  ExpenseIdSchema,
} from "./expenses.schema";
import { ExpenseNotFoundError, ExpenseCategoryNotFoundError } from "./expenses.errors";
import {
  calculateExpenseTotal,
  calculateCategoryBreakdown,
  calculateMonthlySummary,
} from "./expenses.utils";
import {
  getTodayDateString,
  getMonthDateRange,
  formatDateISO,
} from "@/lib/utils/date.utils";
import type {
  ExpenseWithCategory,
  ExpenseCategory,
  MonthlyExpenseSummary,
  CreateExpenseInput,
  UpdateExpenseInput,
  CreateExpenseCategoryInput,
} from "./expenses.types";

export class ExpensesService {
  private readonly repository: ExpensesRepository;

  constructor(supabase: AppSupabaseClient) {
    this.repository = new ExpensesRepository(supabase);
  }

  async getExpenseCategories(userId: string): Promise<ExpenseCategory[]> {
    return await this.repository.findAllCategories(userId);
  }

  async createExpenseCategory(
    userId: string,
    rawInput: CreateExpenseCategoryInput
  ): Promise<ExpenseCategory> {
    const validated = CreateExpenseCategorySchema.parse(rawInput);
    return await this.repository.createCategory(userId, validated);
  }

  async getExpenseById(expenseId: string, userId: string): Promise<ExpenseWithCategory> {
    ExpenseIdSchema.parse(expenseId);
    const expense = await this.repository.findExpenseById(expenseId, userId);
    if (!expense) {
      throw new ExpenseNotFoundError(expenseId);
    }
    return expense;
  }

  async getTodayExpenses(userId: string): Promise<{
    expenses: ExpenseWithCategory[];
    totalAmount: number;
    transactionCount: number;
  }> {
    const today = getTodayDateString();
    const expenses = await this.repository.findExpensesForDate(userId, today);
    const totalAmount = calculateExpenseTotal(expenses);

    return {
      expenses,
      totalAmount,
      transactionCount: expenses.length,
    };
  }

  async getMonthlyExpenses(
    userId: string,
    year: number = new Date().getFullYear(),
    month: number = new Date().getMonth() + 1
  ): Promise<MonthlyExpenseSummary> {
    const { startDate, endDate } = getMonthDateRange(year, month);
    const expenses = await this.repository.findExpensesByDateRange(userId, startDate, endDate);

    return calculateMonthlySummary(expenses, year, month);
  }

  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    expenses: ExpenseWithCategory[];
    totalAmount: number;
    categories: ReturnType<typeof calculateCategoryBreakdown>;
  }> {
    const start = formatDateISO(startDate);
    const end = formatDateISO(endDate);

    const expenses = await this.repository.findExpensesByDateRange(userId, start, end);
    const totalAmount = calculateExpenseTotal(expenses);
    const categories = calculateCategoryBreakdown(expenses);

    return {
      expenses,
      totalAmount,
      categories,
    };
  }

  async createExpense(
    userId: string,
    rawInput: CreateExpenseInput
  ): Promise<ExpenseWithCategory> {
    const validated = CreateExpenseSchema.parse(rawInput);

    // Verify category exists and is accessible
    const category = await this.repository.findCategoryById(
      validated.expenseCategoryId,
      userId
    );
    if (!category) {
      throw new ExpenseCategoryNotFoundError(validated.expenseCategoryId);
    }

    return await this.repository.createExpense(userId, validated);
  }

  async updateExpense(
    expenseId: string,
    userId: string,
    rawInput: UpdateExpenseInput
  ): Promise<ExpenseWithCategory> {
    ExpenseIdSchema.parse(expenseId);
    const validated = UpdateExpenseSchema.parse(rawInput);

    const existing = await this.repository.findExpenseById(expenseId, userId);
    if (!existing) {
      throw new ExpenseNotFoundError(expenseId);
    }

    if (validated.expenseCategoryId) {
      const category = await this.repository.findCategoryById(
        validated.expenseCategoryId,
        userId
      );
      if (!category) {
        throw new ExpenseCategoryNotFoundError(validated.expenseCategoryId);
      }
    }

    const updated = await this.repository.updateExpense(expenseId, userId, validated);
    if (!updated) {
      throw new ExpenseNotFoundError(expenseId);
    }

    return updated;
  }

  async deleteExpense(expenseId: string, userId: string): Promise<boolean> {
    ExpenseIdSchema.parse(expenseId);
    const existing = await this.repository.findExpenseById(expenseId, userId);
    if (!existing) {
      throw new ExpenseNotFoundError(expenseId);
    }
    return await this.repository.deleteExpense(expenseId, userId);
  }
}
