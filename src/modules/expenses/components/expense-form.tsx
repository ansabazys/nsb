"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExpenseSchema } from "../expenses.schema";
import type { CreateExpenseInput, ExpenseCategory } from "../expenses.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getTodayDateString } from "@/lib/utils/date.utils";

export interface ExpenseFormProps {
  categories: ExpenseCategory[];
  initialValues?: Partial<CreateExpenseInput>;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(CreateExpenseSchema),
    defaultValues: {
      amount: initialValues?.amount ?? ("" as unknown as number),
      expenseCategoryId: initialValues?.expenseCategoryId ?? (categories[0]?.id || ""),
      date: initialValues?.date ?? getTodayDateString(),
      description: initialValues?.description ?? "",
      currency: initialValues?.currency ?? "USD",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Amount"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount", { valueAsNumber: true })}
        />

        <Input
          type="date"
          label="Date"
          error={errors.date?.message}
          {...register("date")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          error={errors.expenseCategoryId?.message}
          {...register("expenseCategoryId")}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Select
          label="Currency"
          error={errors.currency?.message}
          {...register("currency")}
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
          <option value="AED">AED (د.إ)</option>
        </Select>
      </div>

      <Input
        label="Description (Optional)"
        placeholder="e.g. Groceries, coffee, subscription"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Log Expense"}
        </Button>
      </div>
    </form>
  );
}
