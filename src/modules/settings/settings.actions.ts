"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/supabase/auth";
import { SettingsService } from "./settings.service";
import type { UserProfile, UpdateProfileInput } from "./settings.types";
import type { ActionResult } from "@/types/actions.types";

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ActionResult<UserProfile>> {
  try {
    const user = await requireCurrentUser();
    const supabase = await createServerSupabaseClient();
    const service = new SettingsService(supabase);
    const result = await service.updateProfile(user.id, input);

    revalidatePath("/settings");

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
