import { z } from "zod";

export const HabitFrequencySchema = z.enum(["daily", "weekly", "custom"]);

export const CreateHabitSchema = z.object({
  name: z
    .string({ required_error: "Habit name is required." })
    .min(1, "Habit name cannot be empty.")
    .max(100, "Habit name must be 100 characters or fewer.")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .nullish(),
  frequency: HabitFrequencySchema.default("daily"),
  targetPerPeriod: z
    .number()
    .int("Target must be an integer.")
    .min(1, "Target must be at least 1.")
    .max(100, "Target cannot exceed 100.")
    .default(1),
});

export const UpdateHabitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name cannot be empty.")
    .max(100, "Habit name must be 100 characters or fewer.")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .nullish(),
  frequency: HabitFrequencySchema.optional(),
  targetPerPeriod: z
    .number()
    .int("Target must be an integer.")
    .min(1, "Target must be at least 1.")
    .max(100, "Target cannot exceed 100.")
    .optional(),
  isArchived: z.boolean().optional(),
});

export const LogHabitCompletionSchema = z.object({
  habitId: z.string().uuid("Invalid habit UUID."),
  completedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer.")
    .nullish(),
});

export const HabitIdSchema = z.string().uuid("Invalid habit UUID.");
