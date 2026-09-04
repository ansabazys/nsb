import type { AppSupabaseClient } from "@/types/database.types";
import { SettingsRepository } from "./settings.repository";
import { UpdateProfileSchema } from "./settings.schema";
import { ProfileNotFoundError } from "./settings.errors";
import type { UserProfile, UpdateProfileInput } from "./settings.types";

export class SettingsService {
  private readonly repository: SettingsRepository;

  constructor(supabase: AppSupabaseClient) {
    this.repository = new SettingsRepository(supabase);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.repository.findProfileById(userId);
    if (!profile) {
      throw new ProfileNotFoundError(userId);
    }
    return profile;
  }

  async updateProfile(userId: string, rawInput: UpdateProfileInput): Promise<UserProfile> {
    const validated = UpdateProfileSchema.parse(rawInput);

    const existing = await this.repository.findProfileById(userId);
    if (!existing) {
      throw new ProfileNotFoundError(userId);
    }

    const updated = await this.repository.updateProfile(userId, validated);
    if (!updated) {
      throw new ProfileNotFoundError(userId);
    }

    return updated;
  }
}
