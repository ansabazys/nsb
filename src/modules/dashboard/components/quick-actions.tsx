"use client";

import * as React from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CreateHabitModal } from "@/modules/habits/components/create-habit-modal";
import { cn } from "@/lib/utils/cn";
import { TasksIcon } from "@/components/icons/tasks-icon";
import { HabitsIcon } from "@/components/icons/habits-icon";
import { ExpensesIcon } from "@/components/icons/expenses-icon";
import { GoalsIcon } from "@/components/icons/goals-icon";

export interface QuickActionsProps {
  className?: string;
  userName?: string;
  meetingCount?: number;
  habitCount?: number;
}

export function QuickActions({
  className,
  userName: propUserName,
  meetingCount = 3,
  habitCount: propHabitCount,
}: QuickActionsProps) {
  const [isCreateHabitOpen, setIsCreateHabitOpen] = React.useState(false);
  const [userName, setUserName] = React.useState<string>(
    propUserName ? propUserName.toUpperCase() : "ANSAB"
  );
  const [habitCount, setHabitCount] = React.useState<number>(
    propHabitCount ?? 0
  );

  React.useEffect(() => {
    if (propHabitCount !== undefined) {
      setHabitCount(propHabitCount);
    }
  }, [propHabitCount]);

  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const fetchHabitCount = async (userId: string) => {
      try {
        const { count, error } = await supabase
          .from("habits")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_archived", false);

        if (!error && count !== null && count !== undefined) {
          setHabitCount(count);
        } else {
          setHabitCount(0);
        }
      } catch {
        setHabitCount(0);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        if (!propUserName) {
          const rawName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.first_name ||
            (user.email ? user.email.split("@")[0] : null) ||
            "ANSAB";
          const firstName = rawName.trim().split(/\s+/)[0];
          setUserName(firstName.toUpperCase() || "ANSAB");
        }
        if (propHabitCount === undefined) {
          fetchHabitCount(user.id);
        }
      }
    });

    const handleCreated = () => {
      setHabitCount((prev) => prev + 1);
    };

    const handleUpdated = () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && propHabitCount === undefined) {
          fetchHabitCount(user.id);
        }
      });
    };

    window.addEventListener("nsb:habit-created", handleCreated);
    window.addEventListener("nsb:habit-updated", handleUpdated);

    return () => {
      window.removeEventListener("nsb:habit-created", handleCreated);
      window.removeEventListener("nsb:habit-updated", handleUpdated);
    };
  }, [propUserName, propHabitCount]);

  const actions = [
    {
      label: "Task",
      href: "/tasks",
      icon: TasksIcon,
      accent: "hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-300 text-neutral-300",
      iconColor: "text-blue-400",
      symbol: "✓",
    },
    {
      label: "Habit",
      href: "/habits",
      icon: HabitsIcon,
      accent: "hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-300 text-neutral-300",
      iconColor: "text-orange-400",
      symbol: "♨",
    },
    {
      label: "Expense",
      href: "/expenses",
      icon: ExpensesIcon,
      accent: "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300 text-neutral-300",
      iconColor: "text-emerald-400",
      symbol: "▣",
    },
    {
      label: "Goal",
      href: "/goals",
      icon: GoalsIcon,
      accent: "hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300 text-neutral-300",
      iconColor: "text-purple-400",
      symbol: "◎",
    },
  ];

  return (
    <div
      className={cn(
        "w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-1",
        className
      )}
    >
      {/* Left: Greeting and status block */}
      <div className="flex flex-col justify-center select-none font-mono uppercase tracking-wider shrink-0">
        <span className="text-xs font-medium text-neutral-100 leading-tight">
          GOOD MORNING, {userName}.
        </span>
        <span className="text-[11px] font-normal text-neutral-400 leading-tight mt-1">
          YOU HAVE {meetingCount} {meetingCount === 1 ? "MEETING" : "MEETINGS"} AND {habitCount} {habitCount === 1 ? "HABIT" : "HABITS"} TODAY.
        </span>
      </div>

      {/* Right: Quick Action buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;

          if (action.label === "Habit") {
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => setIsCreateHabitOpen(true)}
                className={cn(
                  "group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-neutral-300 transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer",
                  action.accent
                )}
                aria-label={`Quick Action: ${action.label}`}
              >
                <Icon className={cn("w-3.5 h-3.5 transition-transform group-hover:scale-110", action.iconColor)} />
                <span className="font-medium tracking-tight">{action.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-medium text-neutral-300 transition-all duration-150 shadow-sm active:scale-[0.98]",
                action.accent
              )}
              aria-label={`Quick Action: ${action.label}`}
            >
              <Icon className={cn("w-3.5 h-3.5 transition-transform group-hover:scale-110", action.iconColor)} />
              <span className="font-medium tracking-tight">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateHabitOpen}
        onClose={() => setIsCreateHabitOpen(false)}
      />
    </div>
  );
}
