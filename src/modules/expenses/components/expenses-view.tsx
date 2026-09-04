"use client";

import * as React from "react";
import type {
  ExpenseWithCategory,
  ExpenseCategory,
  MonthlyExpenseSummary,
} from "../expenses.types";
import { useExpenses } from "../hooks/use-expenses";
import { ExpenseList } from "./expense-list";
import { ExpenseSummary } from "./expense-summary";
import { ExpenseForm } from "./expense-form";
import { PageHeader } from "@/components/shared/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ExpensesViewProps {
  initialExpenses: ExpenseWithCategory[];
  categories: ExpenseCategory[];
  summary: MonthlyExpenseSummary;
}

export function ExpensesView({
  initialExpenses,
  categories,
  summary,
}: ExpensesViewProps) {
  const { expenses, isPending, error, createExpense, deleteExpense } =
    useExpenses(initialExpenses);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Personal finance tracking and monthly category budget breakdown"
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + Log Expense
          </Button>
        }
      />

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <ExpenseSummary summary={summary} />

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-neutral-900">Recent Transactions</h3>
        <ExpenseList
          expenses={expenses}
          onDelete={deleteExpense}
          onAddNew={() => setIsCreateOpen(true)}
          isPending={isPending}
        />
      </div>

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log New Expense"
        description="Record a personal transaction or purchase."
      >
        <ExpenseForm
          categories={categories}
          onSubmit={async (data) => {
            const res = await createExpense(data);
            if (res?.success) {
              setIsCreateOpen(false);
            }
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isPending}
        />
      </Dialog>
    </div>
  );
}
