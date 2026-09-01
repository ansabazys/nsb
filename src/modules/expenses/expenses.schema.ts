import { z } from "zod";

export const CreateExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid("Invalid expense category UUID."),
  amount: z
    .number({ required_error: "Expense amount is required." })
    .positive("Amount must be greater than zero.")
    .max(1_000_000_000, "Amount exceeds maximum limit."),
  currency: z
    .string()
    .min(3, "Currency code must be 3 characters.")
    .max(3, "Currency code must be 3 characters.")
    .default("USD"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .optional(),
  description: z
    .string()
    .max(255, "Description must be 255 characters or fewer.")
    .nullish(),
});

export const UpdateExpenseSchema = z.object({
  expenseCategoryId: z.string().uuid("Invalid expense category UUID.").optional(),
  amount: z
    .number()
    .positive("Amount must be greater than zero.")
    .max(1_000_000_000, "Amount exceeds maximum limit.")
    .optional(),
  currency: z.string().length(3).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .optional(),
  description: z
    .string()
    .max(255, "Description must be 255 characters or fewer.")
    .nullish(),
});

export const CreateExpenseCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required." })
    .min(1, "Category name cannot be empty.")
    .max(50, "Category name must be 50 characters or fewer.")
    .trim(),
  icon: z.string().max(50).nullish(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex code.")
    .nullish(),
});

export const ExpenseIdSchema = z.string().uuid("Invalid expense UUID.");
export const ExpenseCategoryIdSchema = z.string().uuid("Invalid category UUID.");
