import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SettingsService } from "@/modules/settings/settings.service";
import { SettingsView } from "@/modules/settings/components/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const settingsService = new SettingsService(supabase);
  const profile = await settingsService.getProfile(user.id);

  return <SettingsView initialProfile={profile} />;
}
