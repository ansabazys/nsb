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
 * Automatically ensures a corresponding profile row exists to satisfy foreign keys.
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("You must be logged in to perform this action.");
  }

  try {
    const { createAdminClient } = await import("./admin");
    const admin = createAdminClient();
    const rawName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.first_name ||
      (user.email ? user.email.split("@")[0] : "User");

    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: rawName,
        timezone: "UTC",
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.warn("[requireCurrentUser] Warning: profile upsert check failed:", err);
  }

  return user;
}

