import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { DashboardIcon } from "@/components/icons/dashboard-icon";
import { HabitsIcon } from "@/components/icons/habits-icon";
import { ExpensesIcon } from "@/components/icons/expenses-icon";
import { GoalsIcon } from "@/components/icons/goals-icon";
import { TasksIcon } from "@/components/icons/tasks-icon";
import { SettingsIcon } from "@/components/icons/settings-icon";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const menuItems = [
    { title: "Dashboard", href: "/dashboard", icon: DashboardIcon, desc: "Overview & metrics" },
    { title: "Habits & Rituals", href: "/habits", icon: HabitsIcon, desc: "Daily routines & streaks" },
    { title: "Expenses & Budget", href: "/expenses", icon: ExpensesIcon, desc: "Finances & transactions" },
    { title: "Goals & Targets", href: "/goals", icon: GoalsIcon, desc: "Milestones & progress" },
    { title: "Tasks & Priorities", href: "/tasks", icon: TasksIcon, desc: "To-do lists & work items" },
    { title: "Settings", href: "/settings", icon: SettingsIcon, desc: "Profile & preferences" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800">
        <h1 className="text-sm font-mono uppercase tracking-wider text-white font-medium">
          /menu
        </h1>
        <span className="text-xs font-mono text-neutral-400">
          {user.email}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800/80 border border-neutral-700/50 text-neutral-300 group-hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {item.desc}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
