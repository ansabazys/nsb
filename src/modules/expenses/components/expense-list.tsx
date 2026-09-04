"use client";

import * as React from "react";
import type { ExpenseWithCategory } from "../expenses.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

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
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-neutral-50/50">
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {expense.date}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {expense.description || "Untitled Expense"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{expense.category.name}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                  ${expense.amount.toFixed(2)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
