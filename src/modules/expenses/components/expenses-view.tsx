"use client";

import * as React from "react";
import type {
  ExpenseWithCategory,
  ExpenseCategory,
  MonthlyExpenseSummary,
} from "../expenses.types";

import { FinancialOverview } from "./financial-overview";
import { SpendingTrendChart } from "./spending-trend-chart";

export interface ExpensesViewProps {
  initialExpenses?: ExpenseWithCategory[];
  categories?: ExpenseCategory[];
  summary?: MonthlyExpenseSummary;
}

export function ExpensesView({
  initialExpenses = [],
  categories = [],
  summary,
}: ExpensesViewProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <FinancialOverview />
      <SpendingTrendChart />
    </div>
  );
}

