"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema } from "../tasks.schema";
import type { CreateTaskInput } from "../tasks.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface TaskFormProps {
  initialValues?: Partial<CreateTaskInput>;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      priority: initialValues?.priority ?? "medium",
      dueDate: initialValues?.dueDate ?? undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Task Title"
        placeholder="e.g. Submit tax documentation"
        error={errors.title?.message}
        {...register("title")}
      />

      <Textarea
        label="Description (Optional)"
        placeholder="e.g. Any relevant notes or checklist details"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          error={errors.priority?.message}
          {...register("priority")}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>

        <Input
          type="date"
          label="Due Date (Optional)"
          error={errors.dueDate?.message}
          {...register("dueDate")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Task"}
        </Button>
      </div>
    </form>
  );
}
