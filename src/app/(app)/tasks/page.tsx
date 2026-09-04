import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TasksService } from "@/modules/tasks/tasks.service";
import { TasksView } from "@/modules/tasks/components/tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  const tasksService = new TasksService(supabase);
  const tasks = await tasksService.getUserTasks(user.id);

  return <TasksView initialTasks={tasks} />;
}
