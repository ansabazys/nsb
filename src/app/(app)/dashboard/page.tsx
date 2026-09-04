import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HabitsService } from "@/modules/habits/habits.service";
import { HabitWidget } from "@/modules/dashboard/components/habit-widget";
import { mapHabitToWidgetItem } from "@/modules/dashboard/dashboard.utils";
import type { HabitWidgetItem } from "@/modules/dashboard/dashboard.types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let habitItems: HabitWidgetItem[] = [];
  try {
    const supabase = await createServerSupabaseClient();
    const habitsService = new HabitsService(supabase);
    const { habits } = await habitsService.getTodayHabits(user.id);
    habitItems = habits.map((h, i) => mapHabitToWidgetItem(h, i));
  } catch (error) {
    console.error("Failed to load dashboard habits:", error);
    habitItems = [];
  }

  return (
    <div className="w-full">
      {/* Dashboard Canvas */}
      <HabitWidget initialHabits={habitItems} />
    </div>
  );
}


