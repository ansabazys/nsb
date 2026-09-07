"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { DashboardIcon } from "@/components/icons/dashboard-icon";
import { HabitsIcon } from "@/components/icons/habits-icon";
import { ExpensesIcon } from "@/components/icons/expenses-icon";
import { GoalsIcon } from "@/components/icons/goals-icon";
import { TasksIcon } from "@/components/icons/tasks-icon";

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
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-0 right-0 z-40 flex items-center justify-around px-4 pointer-events-none select-none">
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
              "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-xl bg-transparent transition-colors",
              isActive
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-200 active:text-white"
            )}
            aria-label={item.name}
          >
            <Icon className={cn("h-5 w-5 stroke-[1.8]", isActive && "stroke-[2.2]")} />
          </Link>
        );
      })}
    </nav>
  );
}

