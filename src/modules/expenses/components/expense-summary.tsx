import * as React from "react";
import type { MonthlyExpenseSummary } from "../expenses.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ExpenseSummaryProps {
  summary: MonthlyExpenseSummary;
}

export function ExpenseSummary({ summary }: ExpenseSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">
            Total Spent ({summary.month}/{summary.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-neutral-900">
            ${summary.totalAmount.toFixed(2)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {summary.transactionCount} total transaction{summary.transactionCount === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-500">
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.categories.length === 0 ? (
            <p className="text-xs text-neutral-400">No expenses recorded for this period.</p>
          ) : (
            <div className="space-y-2">
              {summary.categories.map((cat) => (
                <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700">{cat.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">{cat.percentage}%</span>
                    <Badge variant="secondary">${cat.totalAmount.toFixed(2)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
