import { z } from "zod";

export const GoalStatusSchema = z.enum(["not_started", "in_progress", "completed", "abandoned"]);

export const CreateGoalSchema = z.object({
  name: z
    .string({ required_error: "Goal name is required." })
    .min(1, "Goal name cannot be empty.")
    .max(100, "Goal name must be 100 characters or fewer.")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer.")
    .nullish(),
  targetValue: z
    .number({ required_error: "Target value is required." })
    .positive("Target value must be greater than zero."),
  currentValue: z
    .number()
    .min(0, "Current value cannot be negative.")
    .default(0),
  unit: z.string().max(30, "Unit must be 30 characters or fewer.").nullish(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format.")
    .nullish(),
  status: GoalStatusSchema.default("not_started"),
});

export const UpdateGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Goal name cannot be empty.")
    .max(100, "Goal name must be 100 characters or fewer.")
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer.")
    .nullish(),
  targetValue: z
    .number()
    .positive("Target value must be greater than zero.")
    .optional(),
  currentValue: z.number().min(0, "Current value cannot be negative.").optional(),
  unit: z.string().max(30).nullish(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format.")
    .nullish(),
  status: GoalStatusSchema.optional(),
});

export const UpdateGoalProgressSchema = z.object({
  currentValue: z.number().min(0, "Current value cannot be negative."),
});

export const GoalIdSchema = z.string().uuid("Invalid goal UUID.");
