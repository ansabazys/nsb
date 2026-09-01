import { z } from "zod";

export const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name cannot be empty.")
    .max(100, "Full name must be 100 characters or fewer.")
    .trim()
    .nullish(),
  avatarUrl: z
    .string()
    .url("Avatar URL must be a valid URL.")
    .max(500, "Avatar URL must be 500 characters or fewer.")
    .nullish(),
  timezone: z
    .string()
    .min(1, "Timezone cannot be empty.")
    .max(50, "Timezone must be 50 characters or fewer.")
    .optional(),
});
