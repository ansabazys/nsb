"use client";

import { useState } from "react";
import type { UserProfile, UpdateProfileInput } from "../settings.types";
import { updateProfileAction } from "../settings.actions";

export function useSettings(initialProfile: UserProfile) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (input: UpdateProfileInput) => {
    setIsLoading(true);
    setError(null);
    const res = await updateProfileAction(input);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error);
      return res;
    }
    setProfile(res.data);
    return res;
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}
