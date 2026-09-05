"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { DashboardIcon } from "@/components/icons/dashboard-icon";
import { HabitsIcon } from "@/components/icons/habits-icon";
import { ExpensesIcon } from "@/components/icons/expenses-icon";
import { GoalsIcon } from "@/components/icons/goals-icon";
import { TasksIcon } from "@/components/icons/tasks-icon";
import { SettingsIcon } from "@/components/icons/settings-icon";
import { LogoutIcon } from "@/components/icons/logout-icon";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { name: "Habits & Rituals", href: "/habits", icon: HabitsIcon },
  { name: "Expenses & Budget", href: "/expenses", icon: ExpensesIcon },
  { name: "Goals & Targets", href: "/goals", icon: GoalsIcon },
  { name: "Tasks & Priorities", href: "/tasks", icon: TasksIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-4 sm:left-5 lg:left-6 top-6 sm:top-8 bottom-6 sm:bottom-8 z-40 hidden md:flex flex-col justify-between pointer-events-none select-none">
      {/* Top: Brand Text NSB */}
      <div className="pointer-events-auto flex items-center justify-center h-8 w-10">
        <Link
          href="/dashboard"
          className="text-xs font-bold tracking-widest text-white hover:text-neutral-300 transition-colors uppercase font-mono leading-none"
          aria-label="NSB Dashboard"
        >
          NSB
        </Link>
      </div>

      {/* Center: Vertical Navigation Stack */}
      <div className="pointer-events-auto my-auto flex flex-col items-center gap-1.5">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <div key={item.href} className="relative group flex items-center">
              <Link
                href={item.href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "text-neutral-500 hover:text-neutral-200"
                )}
                aria-label={item.name}
              >
                <Icon className={cn("h-5 w-5 stroke-[1.8]", isActive && "stroke-[2.2]")} />
              </Link>

              {/* Hover Tooltip Floating on the Right */}
              <div className="absolute left-full ml-3 hidden group-hover:flex items-center pointer-events-none z-50">
                <div className="whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl border border-neutral-800 font-sans">
                  {item.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Settings & Sign Out Stack */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5">
        {/* Settings */}
        <div className="relative group flex items-center">
          <Link
            href="/settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-all duration-200",
              pathname?.startsWith("/settings")
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-200"
            )}
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>

          {/* Tooltip */}
          <div className="absolute left-full ml-3 hidden group-hover:flex items-center pointer-events-none z-50">
            <div className="whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl border border-neutral-800 font-sans">
              Settings
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="relative group flex items-center">
          <button
            onClick={handleSignOut}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-neutral-500 hover:text-red-400 transition-all duration-200 cursor-pointer"
            aria-label="Sign Out"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>

          {/* Tooltip */}
          <div className="absolute left-full ml-3 hidden group-hover:flex items-center pointer-events-none z-50">
            <div className="whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-red-400 shadow-xl border border-neutral-800 font-sans">
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
