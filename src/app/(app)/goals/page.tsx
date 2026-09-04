import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GoalsService } from "@/modules/goals/goals.service";
import { GoalsView } from "@/modules/goals/components/goals-view";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const goalsService = new GoalsService(supabase);
  const goals = await goalsService.getUserGoals(user.id);

  return <GoalsView initialGoals={goals} />;
}
