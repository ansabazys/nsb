import type { Database, AppSupabaseClient } from "@/types/database.types";
import type { UserProfile, UpdateProfileInput } from "./settings.types";
import { DatabaseError } from "@/lib/errors/app-error";

export class SettingsRepository {
  constructor(private readonly supabase: AppSupabaseClient) {}

  private mapProfileRow(row: Database["public"]["Tables"]["profiles"]["Row"]): UserProfile {
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      timezone: row.timezone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to find user profile.", error);
    }

    return this.mapProfileRow(data);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile | null> {
    const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = {};

    if (input.fullName !== undefined) updatePayload.full_name = input.fullName;
    if (input.avatarUrl !== undefined) updatePayload.avatar_url = input.avatarUrl;
    if (input.timezone !== undefined) updatePayload.timezone = input.timezone;

    const { data, error } = await this.supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new DatabaseError("Failed to update user profile.", error);
    }

    return this.mapProfileRow(data);
  }
}
