"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGoalSchema } from "../goals.schema";
import type { CreateGoalInput } from "../goals.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface GoalFormProps {
  initialValues?: Partial<CreateGoalInput>;
  onSubmit: (data: CreateGoalInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function GoalForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: GoalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(CreateGoalSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      targetValue: initialValues?.targetValue ?? 100,
      currentValue: initialValues?.currentValue ?? 0,
      unit: initialValues?.unit ?? "%",
      deadline: initialValues?.deadline ?? undefined,
      status: initialValues?.status ?? "not_started",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Goal Name"
        placeholder="e.g. Save $10,000 for emergency fund"
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Description (Optional)"
        placeholder="e.g. Why this goal matters and milestone breakdown"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          error={errors.status?.message}
          {...register("status")}
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </Select>

        <Input
          type="date"
          label="Target Deadline"
          error={errors.deadline?.message}
          {...register("deadline")}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          type="number"
          label="Current Value"
          error={errors.currentValue?.message}
          {...register("currentValue", { valueAsNumber: true })}
        />

        <Input
          type="number"
          label="Target Value"
          error={errors.targetValue?.message}
          {...register("targetValue", { valueAsNumber: true })}
        />

        <Input
          type="text"
          label="Unit"
          placeholder="e.g. $, pages, km"
          error={errors.unit?.message}
          {...register("unit")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Goal"}
        </Button>
      </div>
    </form>
  );
}
