export interface ExpenseCategory {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  expenseCategoryId: string;
  amount: number;
  currency: string;
  date: string; // YYYY-MM-DD
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

export interface CategoryExpenseSummary {
  categoryId: string;
  categoryName: string;
  color: string | null;
  icon: string | null;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyExpenseSummary {
  year: number;
  month: number;
  totalAmount: number;
  transactionCount: number;
  dailyAverage: number;
  categories: CategoryExpenseSummary[];
}

export interface CreateExpenseInput {
  expenseCategoryId: string;
  amount: number;
  currency?: string;
  date?: string; // defaults to today (YYYY-MM-DD)
  description?: string | null;
}

export interface UpdateExpenseInput {
  expenseCategoryId?: string;
  amount?: number;
  currency?: string;
  date?: string;
  description?: string | null;
}

export interface CreateExpenseCategoryInput {
  name: string;
  icon?: string | null;
  color?: string | null;
}
