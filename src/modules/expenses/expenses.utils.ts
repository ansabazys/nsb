import type {
  ExpenseWithCategory,
  CategoryExpenseSummary,
  MonthlyExpenseSummary,
} from "./expenses.types";

/**
 * Sums the total monetary amount from a list of expenses
 */
export function calculateExpenseTotal(expenses: { amount: number }[]): number {
  const total = expenses.reduce((accumulator, item) => accumulator + Number(item.amount), 0);
  return Number(total.toFixed(2));
}

/**
 * Aggregates a list of expenses by category with percentages and transaction counts
 */
export function calculateCategoryBreakdown(
  expenses: ExpenseWithCategory[]
): CategoryExpenseSummary[] {
  if (expenses.length === 0) return [];

  const total = calculateExpenseTotal(expenses);
  const categoryMap = new Map<
    string,
    {
      categoryName: string;
      color: string | null;
      icon: string | null;
      totalAmount: number;
      transactionCount: number;
    }
  >();

  for (const exp of expenses) {
    const existing = categoryMap.get(exp.expenseCategoryId) ?? {
      categoryName: exp.category.name,
      color: exp.category.color,
      icon: exp.category.icon,
      totalAmount: 0,
      transactionCount: 0,
    };

    existing.totalAmount += Number(exp.amount);
    existing.transactionCount += 1;
    categoryMap.set(exp.expenseCategoryId, existing);
  }

  const summaries: CategoryExpenseSummary[] = [];
  for (const [categoryId, val] of categoryMap.entries()) {
    const roundedTotal = Number(val.totalAmount.toFixed(2));
    const percentage = total > 0 ? Number(((roundedTotal / total) * 100).toFixed(1)) : 0;

    summaries.push({
      categoryId,
      categoryName: val.categoryName,
      color: val.color,
      icon: val.icon,
      totalAmount: roundedTotal,
      transactionCount: val.transactionCount,
      percentage,
    });
  }

  // Sort descending by highest spending
  return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Produces a monthly expense summary including daily averages and category breakdowns
 */
export function calculateMonthlySummary(
  expenses: ExpenseWithCategory[],
  year: number,
  month: number
): MonthlyExpenseSummary {
  const totalAmount = calculateExpenseTotal(expenses);
  const transactionCount = expenses.length;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dailyAverage =
    daysInMonth > 0 ? Number((totalAmount / daysInMonth).toFixed(2)) : 0;
  const categories = calculateCategoryBreakdown(expenses);

  return {
    year,
    month,
    totalAmount,
    transactionCount,
    dailyAverage,
    categories,
  };
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

/**
 * Determines whether a transaction record represents an income.
 */
export function isIncomeTransaction(expense: {
  category?: { name?: string | null } | null;
  description?: string | null;
}): boolean {
  const catName = expense.category?.name?.toLowerCase().trim() ?? "";
  const desc = expense.description?.toLowerCase().trim() ?? "";

  if (
    catName === "income" ||
    catName.startsWith("income") ||
    catName.includes("salary") ||
    catName.includes("freelance & bonus")
  ) {
    return true;
  }

  if (desc.startsWith("[income]")) {
    return true;
  }

  return false;
}

/**
 * Removes the [INCOME] marker prefix for clean user display.
 */
export function formatTransactionDescription(description?: string | null): string {
  if (!description) return "";
  return description.replace(/^\[income\]\s*/i, "").trim();
}

/**
 * Calculates total income, total expense, and net balance from transactions.
 */
export function calculateBalanceSummary(
  transactions: ExpenseWithCategory[]
): BalanceSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of transactions) {
    const amount = Number(item.amount) || 0;
    if (isIncomeTransaction(item)) {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }
  }

  const netBalance = Number((totalIncome - totalExpense).toFixed(2));

  return {
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    netBalance,
  };
}
