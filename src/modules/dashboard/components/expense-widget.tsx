"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  calculateBalanceSummary,
  isIncomeTransaction,
} from "@/modules/expenses/expenses.utils";
import type {
  ExpenseWithCategory,
  ExpenseCategory,
} from "@/modules/expenses/expenses.types";
import { TransactionModal, type TransactionType } from "./transaction-modal";

export interface ExpenseWidgetProps {
  expenses?: ExpenseWithCategory[];
  categories?: ExpenseCategory[];
  year?: number;
  month?: number;
  className?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createChartPath(values: number[]): string {
  if (values.length === 0) return "M0 30 L100 30";
  const width = 100;
  const height = 58;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * width;
      const y = height - 4 - ((value - min) / range) * (height - 8);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function ExpenseWidget({
  expenses = [],
  categories = [],
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  className,
}: ExpenseWidgetProps) {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<ExpenseWithCategory[]>(expenses);
  const [modalType, setModalType] = React.useState<TransactionType | null>(null);
  const [period, setPeriod] = React.useState<"24H" | "7D" | "30D">("7D");

  // Keep local transactions state synced if initial expenses prop updates
  React.useEffect(() => {
    setTransactions(expenses);
  }, [expenses]);

  // Balance calculation: netBalance = totalIncome - totalExpense
  const { totalIncome, totalExpense, netBalance } = React.useMemo(() => {
    return calculateBalanceSummary(transactions);
  }, [transactions]);

  // Chart data based on selected period
  const linePath = React.useMemo(() => {
    const today = new Date();
    const daysCount = period === "24H" ? 1 : period === "7D" ? 7 : 30;

    // Daily net map (income positive, expense negative)
    const dailyNet = new Map<string, number>();
    for (const item of transactions) {
      const isInc = isIncomeTransaction(item);
      const delta = isInc ? item.amount : -item.amount;
      dailyNet.set(item.date, (dailyNet.get(item.date) ?? 0) + delta);
    }

    if (period === "24H") {
      const todayKey = dateKey(today);
      const todayNet = dailyNet.get(todayKey) ?? 0;
      return createChartPath([0, todayNet * 0.4, todayNet * 0.7, todayNet]);
    }

    const cumulativeValues = Array.from({ length: daysCount }, (_, index) => {
      const d = new Date(today.getTime() - (daysCount - 1 - index) * DAY_IN_MS);
      return dailyNet.get(dateKey(d)) ?? 0;
    }).reduce<number[]>((values, value) => {
      const last = values.at(-1) ?? 0;
      return [...values, last + value];
    }, []);

    return createChartPath(cumulativeValues);
  }, [transactions, period]);

  const handleTransactionSuccess = (newTx: ExpenseWithCategory) => {
    setTransactions((prev) => [newTx, ...prev]);
    router.refresh();
  };

  return (
    <>
      <section
        aria-label={`${month}/${year} financial overview`}
        className={cn("w-full max-w-[360px]", className)}
      >
        {/* Main Card */}
        <div className="flex aspect-[1.586/1] flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/75 px-5 pt-4 shadow-sm transition-all">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-neutral-400">Total balance</p>
            {/* Period Filters (Borderless) */}
            <div
              className="flex items-center gap-3 text-[11px] text-neutral-300"
              aria-label="Chart period"
            >
              {(["24H", "7D", "30D"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    period === p
                      ? "rounded-lg bg-neutral-900 px-2.5 py-1.5 text-white"
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Balance Display */}
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <p className="text-[32px] font-semibold tracking-tight text-white sm:text-[36px]">
              {currencyFormatter.format(netBalance)}
            </p>
            {/* Quick Micro-Badge */}
            <div className="flex items-center gap-2 text-[11px] font-medium">
              {totalIncome > 0 && (
                <span className="text-emerald-400/90" title="Total Income">
                  +{currencyFormatter.format(totalIncome)}
                </span>
              )}
              {totalExpense > 0 && (
                <span className="text-rose-400/90" title="Total Expenses">
                  -{currencyFormatter.format(totalExpense)}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Trend Chart */}
          <div
            className="-mx-5 mt-2 min-h-0 flex-1"
            role="img"
            aria-label={`Balance trend over ${period}`}
          >
            <svg
              viewBox="0 0 100 64"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="balance-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d={`${linePath} L100 64 L0 64 Z`}
                fill="url(#balance-chart-fill)"
                className="transition-all duration-300"
              />
              <path
                d={linePath}
                fill="none"
                stroke="#4ade80"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.3"
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>

        {/* Action Buttons Row: Income, Expense, View all (No Icons) */}
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setModalType("income")}
            className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/75 py-4 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-900 cursor-pointer"
            aria-label="Income"
          >
            Income
          </button>

          <button
            type="button"
            onClick={() => setModalType("expense")}
            className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/75 py-4 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-900 cursor-pointer"
            aria-label="Expense"
          >
            Expense
          </button>

          <button
            type="button"
            onClick={() => router.push("/expenses")}
            className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/75 py-4 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-900 cursor-pointer"
            aria-label="View all"
          >
            View all
          </button>
        </div>
      </section>

      {/* Transaction Modal for Add Income and Add Expense */}
      <TransactionModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        initialType={modalType ?? "expense"}
        categories={categories}
        onSuccess={handleTransactionSuccess}
      />
    </>
  );
}

export default ExpenseWidget;


