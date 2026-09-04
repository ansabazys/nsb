import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HabitsService } from "@/modules/habits/habits.service";
import { HabitsView } from "@/modules/habits/components/habits-view";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const habitsService = new HabitsService(supabase);
  const habits = await habitsService.getUserHabits(user.id);

  return <HabitsView initialHabits={habits} />;
}
