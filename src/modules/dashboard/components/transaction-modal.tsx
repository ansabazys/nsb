"use client";

import * as React from "react";
import { X, TrendingUp, TrendingDown, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getTodayDateString } from "@/lib/utils/date.utils";
import { createTransactionAction } from "@/modules/expenses/expenses.actions";
import type { ExpenseCategory, ExpenseWithCategory } from "@/modules/expenses/expenses.types";

export type TransactionType = "income" | "expense";

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  categories: ExpenseCategory[];
  onSuccess?: (transaction: ExpenseWithCategory) => void;
  currencySymbol?: string;
  currencyCode?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  initialType = "expense",
  categories,
  onSuccess,
  currencySymbol = "₹",
  currencyCode = "INR",
}: TransactionModalProps) {
  const [type, setType] = React.useState<TransactionType>(initialType);
  const [amount, setAmount] = React.useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("");
  const [date, setDate] = React.useState<string>(getTodayDateString());
  const [description, setDescription] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Sync initialType when modal opens or initialType changes
  React.useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount("");
      setDate(getTodayDateString());
      setDescription("");
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialType]);

  // Separate categories into Income and Expense
  const incomeCategories = React.useMemo(() => {
    const list = categories.filter((c) => {
      const name = c.name.toLowerCase();
      return (
        name.includes("income") ||
        name.includes("salary") ||
        name.includes("freelance") ||
        name.includes("investments & savings")
      );
    });
    if (list.length === 0 && categories.length > 0) {
      return categories;
    }
    return list;
  }, [categories]);

  const expenseCategories = React.useMemo(() => {
    const list = categories.filter((c) => {
      const name = c.name.toLowerCase();
      return (
        !name.includes("income") &&
        !name.includes("salary") &&
        !name.includes("freelance")
      );
    });
    return list.length > 0 ? list : categories;
  }, [categories]);

  const activeCategoryList = type === "income" ? incomeCategories : expenseCategories;

  // Ensure an appropriate category is selected when type changes
  React.useEffect(() => {
    if (activeCategoryList.length > 0) {
      const exists = activeCategoryList.some((c) => c.id === selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId(activeCategoryList[0].id);
      }
    }
  }, [type, activeCategoryList, selectedCategoryId]);

  // Keyboard navigation for Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!selectedCategoryId && activeCategoryList.length > 0) {
      setError("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTransactionAction({
        type,
        amount: parsedAmount,
        expenseCategoryId: selectedCategoryId || undefined,
        date: date || getTodayDateString(),
        description: description.trim() || (type === "income" ? "Income" : "Expense"),
        currency: currencyCode,
      });

      if (!res.success) {
        setError(res.error || "Failed to record transaction.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        type === "income" ? "Income added successfully!" : "Expense recorded successfully!"
      );

      if (onSuccess && res.data) {
        onSuccess(res.data);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const isIncome = type === "income";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        {/* Header with Type Selector */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          {/* Segmented Tab Switcher */}
          <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer",
                isIncome
                  ? "bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Add Income
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer",
                !isIncome
                  ? "bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/40"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Add Expense
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Feedback Notifications */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 animate-in fade-in-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Amount Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="transaction-amount"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
              >
                Amount <span className={isIncome ? "text-emerald-400" : "text-rose-400"}>*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-lg font-semibold text-neutral-400 select-none">
                  {currencySymbol}
                </span>
                <input
                  id="transaction-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "w-full pl-8 pr-4 py-2.5 text-xl font-semibold rounded-xl bg-neutral-950/80 border text-white placeholder-neutral-600 focus:outline-none transition-all",
                    isIncome
                      ? "border-neutral-800 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/70"
                      : "border-neutral-800 focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/70"
                  )}
                />
              </div>
            </div>

            {/* 2. Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="transaction-category"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
              >
                Category
              </label>
              <select
                id="transaction-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-all cursor-pointer"
              >
                {activeCategoryList.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white py-1">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Date & Time */}
            <div className="space-y-1.5">
              <label
                htmlFor="transaction-date"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
              >
                Date
              </label>
              <input
                id="transaction-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950/80 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700 transition-all"
              />
            </div>

            {/* 4. Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="transaction-description"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
              >
                Description / Note
              </label>
              <input
                id="transaction-description"
                type="text"
                placeholder={isIncome ? "e.g. Monthly salary or freelance payout" : "e.g. Grocery store run or dinner"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-neutral-800 bg-neutral-950/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-lg transition-all cursor-pointer disabled:opacity-50",
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50 hover:shadow-emerald-900/50 active:scale-[0.98]"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-950/50 hover:shadow-rose-900/50 active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  {isIncome ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{isIncome ? "+ Add Income" : "- Add Expense"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddIncomeModal(props: Omit<TransactionModalProps, "initialType">) {
  return <TransactionModal {...props} initialType="income" />;
}

export function AddExpenseModal(props: Omit<TransactionModalProps, "initialType">) {
  return <TransactionModal {...props} initialType="expense" />;
}
