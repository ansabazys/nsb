"use client";

import * as React from "react";
import type { ExpenseWithCategory } from "../expenses.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

import { isIncomeTransaction, formatTransactionDescription } from "../expenses.utils";
import { cn } from "@/lib/utils/cn";

export interface ExpenseListProps {
  expenses: ExpenseWithCategory[];
  onDelete?: (expenseId: string) => void;
  onAddNew?: () => void;
  isPending?: boolean;
}

export function ExpenseList({
  expenses,
  onDelete,
  onAddNew,
  isPending = false,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses logged"
        description="Track your spending and manage categories by logging your first expense."
        action={
          onAddNew && (
            <button
              onClick={onAddNew}
              className="text-xs font-semibold text-neutral-900 underline"
            >
              Add an expense
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-500 uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {expenses.map((expense) => {
              const isIncome = isIncomeTransaction(expense);
              return (
                <tr key={expense.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {expense.date}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {formatTransactionDescription(expense.description) || (isIncome ? "Income" : "Untitled Expense")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={isIncome ? "secondary" : "outline"}
                      className={isIncome ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" : undefined}
                    >
                      {expense.category.name}
                    </Badge>
                  </td>
                  <td className={cn("px-4 py-3 text-right font-semibold", isIncome ? "text-emerald-600" : "text-neutral-900")}>
                    {isIncome ? `+$${expense.amount.toFixed(2)}` : `-$${expense.amount.toFixed(2)}`}
                  </td>
                <td className="px-4 py-3 text-right">
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense.id)}
                      disabled={isPending}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
