import { NotFoundError } from "@/lib/errors/app-error";

export class ExpenseNotFoundError extends NotFoundError {
  constructor(expenseId?: string) {
    super("Expense", expenseId);
    this.name = "ExpenseNotFoundError";
  }
}

export class ExpenseCategoryNotFoundError extends NotFoundError {
  constructor(categoryId?: string) {
    super("ExpenseCategory", categoryId);
    this.name = "ExpenseCategoryNotFoundError";
  }
}
