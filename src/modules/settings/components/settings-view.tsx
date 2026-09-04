"use client";

import * as React from "react";
import type { UserProfile } from "../settings.types";
import { useSettings } from "../hooks/use-settings";
import { ProfileForm } from "./profile-form";
import { PreferencesForm } from "./preferences-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export interface SettingsViewProps {
  initialProfile: UserProfile;
}

export function SettingsView({ initialProfile }: SettingsViewProps) {
  const { profile, isLoading, error, updateProfile } = useSettings(initialProfile);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleProfileSubmit = async (data: Parameters<typeof updateProfile>[0]) => {
    setSuccessMessage(null);
    const res = await updateProfile(data);
    if (res?.success) {
      setSuccessMessage("Profile updated successfully.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile information and system preferences"
      />

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your public display name, handle, and default currency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            profile={profile}
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>
            Customize your visual theme and calendar settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm />
        </CardContent>
      </Card>
    </div>
  );
}
