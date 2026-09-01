import { createServerSupabaseClient } from "./server";
import { UnauthorizedError } from "@/lib/errors/app-error";
import type { User } from "@supabase/supabase-js";

/**
 * Retrieves the currently authenticated Supabase user or returns null if unauthenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Requires an authenticated Supabase user; throws UnauthorizedError if unauthenticated.
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("You must be logged in to perform this action.");
  }
  return user;
}
