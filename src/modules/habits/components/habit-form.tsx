"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateHabitSchema } from "../habits.schema";
import type { CreateHabitInput } from "../habits.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface HabitFormProps {
  initialValues?: Partial<CreateHabitInput>;
  onSubmit: (data: CreateHabitInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function HabitForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: HabitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHabitInput>({
    resolver: zodResolver(CreateHabitSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      frequency: initialValues?.frequency ?? "daily",
      targetPerPeriod: initialValues?.targetPerPeriod ?? 1,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Habit Name"
        placeholder="e.g. Read 20 pages"
        error={errors.name?.message}
        {...register("name")}
      />

      <Textarea
        label="Description (Optional)"
        placeholder="e.g. In the evening before bed"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Frequency"
          error={errors.frequency?.message}
          {...register("frequency")}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </Select>

        <Input
          type="number"
          label="Target Per Period"
          min={1}
          max={30}
          error={errors.targetPerPeriod?.message}
          {...register("targetPerPeriod", { valueAsNumber: true })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Habit"}
        </Button>
      </div>
    </form>
  );
}
