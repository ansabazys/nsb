import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const CreateTaskSchema = z.object({
  title: z
    .string({ required_error: "Task title is required." })
    .min(1, "Task title cannot be empty.")
    .max(200, "Task title must be 200 characters or fewer.")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .nullish(),
  goalId: z.string().uuid("Invalid goal UUID.").nullish(),
  status: TaskStatusSchema.default("pending"),
  priority: TaskPrioritySchema.default("medium"),
  dueDate: z
    .string()
    .datetime({ offset: true, message: "Due date must be a valid ISO 8601 timestamp string." })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format."))
    .nullish(),
});

export const UpdateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title cannot be empty.")
    .max(200, "Task title must be 200 characters or fewer.")
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .nullish(),
  goalId: z.string().uuid("Invalid goal UUID.").nullish(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  dueDate: z
    .string()
    .datetime({ offset: true, message: "Due date must be a valid ISO 8601 timestamp string." })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format."))
    .nullish(),
});

export const TaskIdSchema = z.string().uuid("Invalid task UUID.");
