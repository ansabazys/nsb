import { cn } from "@/lib/utils/cn";
import type { ExpenseWithCategory } from "@/modules/expenses/expenses.types";

export interface ExpenseWidgetProps { expenses: ExpenseWithCategory[]; year: number; month: number; className?: string; }

const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createChartPath(values: number[]) {
  const width = 100;
  const height = 58;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 3 - ((value - min) / range) * (height - 6);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function ActionButton({ label }: { label: string }) {
  return <button type="button" className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/75 py-4 text-sm font-medium text-neutral-100 transition-colors hover:bg-neutral-900" aria-label={label}>
    {label}
  </button>;
}

export function ExpenseWidget({ expenses, year, month, className }: ExpenseWidgetProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const today = new Date();
  const dailyTotals = new Map<string, number>();
  for (const expense of expenses) dailyTotals.set(expense.date, (dailyTotals.get(expense.date) ?? 0) + expense.amount);

  const cumulativeValues = Array.from({ length: 7 }, (_, index) => dailyTotals.get(dateKey(new Date(today.getTime() - (6 - index) * DAY_IN_MS))) ?? 0)
    .reduce<number[]>((values, value) => [...values, (values.at(-1) ?? 0) + value], []);
  const linePath = createChartPath(cumulativeValues);

  return <section aria-label={`${month}/${year} expense overview`} className={cn("w-full max-w-[360px]", className)}>
    <div className="flex aspect-[1.586/1] flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/75 px-5 pt-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-400">Total balance</p>
        <div className="flex items-center gap-3 text-[11px] text-neutral-300" aria-label="Chart period">
          <span>24H</span>
          <span className="rounded-lg bg-neutral-900 px-2.5 py-1.5 text-white">7D</span>
          <span>30D</span>
        </div>
      </div>
      <p className="mt-1 text-[32px] font-semibold tracking-tight text-white sm:text-[38px]">{currencyFormatter.format(total)}</p>
      <div className="-mx-5 mt-2 min-h-0 flex-1" role="img" aria-label="Expense trend over the last 7 days">
        <svg viewBox="0 0 100 64" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden="true">
          <defs><linearGradient id="expense-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399" stopOpacity="0.55" /><stop offset="100%" stopColor="#34d399" stopOpacity="0.02" /></linearGradient></defs>
          <path d={`${linePath} L100 64 L0 64 Z`} fill="url(#expense-chart-fill)" />
          <path d={linePath} fill="none" stroke="#4ade80" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
    <div className="mt-3 flex gap-3"><ActionButton label="Income" /><ActionButton label="Expense" /><ActionButton label="View all" /></div>
  </section>;
}

export default ExpenseWidget;
