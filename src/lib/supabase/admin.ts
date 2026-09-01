import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Creates an elevated Supabase admin client using the service role key.
 * CAUTION: This client bypasses Row Level Security (RLS).
 * Only use in secure server environments, seed scripts, or background workers.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
