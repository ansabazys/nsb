"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema } from "../settings.schema";
import type { UserProfile, UpdateProfileInput } from "../settings.types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: UpdateProfileInput) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({
  profile,
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullName: profile.fullName ?? "",
      avatarUrl: profile.avatarUrl ?? "",
      timezone: profile.timezone ?? "UTC",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <Input
        label="Full Name"
        placeholder="e.g. John Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <Input
        label="Avatar URL (Optional)"
        placeholder="https://example.com/avatar.jpg"
        error={errors.avatarUrl?.message}
        {...register("avatarUrl")}
      />

      <Select
        label="Timezone"
        error={errors.timezone?.message}
        {...register("timezone")}
      >
        <option value="UTC">UTC</option>
        <option value="America/New_York">America/New_York (EST)</option>
        <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
        <option value="Europe/London">Europe/London (GMT)</option>
        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
      </Select>

      <div className="pt-2">
        <Button type="submit" size="sm" disabled={isLoading || !isDirty}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
