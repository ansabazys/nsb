"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DashboardIcon } from "@/components/icons/dashboard-icon";
import { HabitsIcon } from "@/components/icons/habits-icon";
import { ExpensesIcon } from "@/components/icons/expenses-icon";
import { GoalsIcon } from "@/components/icons/goals-icon";
import { TasksIcon } from "@/components/icons/tasks-icon";
import { SettingsIcon } from "@/components/icons/settings-icon";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mobileNavItems: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: DashboardIcon },
  { name: "Habits", href: "/habits", icon: HabitsIcon },
  { name: "Expenses", href: "/expenses", icon: ExpensesIcon },
  { name: "Goals", href: "/goals", icon: GoalsIcon },
  { name: "Tasks", href: "/tasks", icon: TasksIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-around p-2 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
              isActive
                ? "text-white bg-white/10"
                : "text-neutral-400 hover:text-white"
            )}
            aria-label={item.name}
          >
            <Icon className="h-5 w-5 stroke-[1.8]" />
            <span className="text-[10px] font-medium mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
