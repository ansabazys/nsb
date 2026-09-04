"use client";

import { useState, useTransition } from "react";
import type { ExpenseWithCategory, CreateExpenseInput } from "../expenses.types";
import { createExpenseAction, deleteExpenseAction } from "../expenses.actions";

export function useExpenses(initialExpenses: ExpenseWithCategory[] = []) {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>(initialExpenses);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const createExpense = async (input: CreateExpenseInput) => {
    setError(null);
    const res = await createExpenseAction(input);
    if (!res.success) {
      setError(res.error);
      return res;
    }
    setExpenses((prev) => [res.data, ...prev]);
    return res;
  };

  const deleteExpense = (expenseId: string) => {
    setError(null);
    startTransition(async () => {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      const res = await deleteExpenseAction(expenseId);
      if (!res.success) {
        setError(res.error);
        setExpenses(initialExpenses);
      }
    });
  };

  return {
    expenses,
    isPending,
    error,
    createExpense,
    deleteExpense,
  };
}
