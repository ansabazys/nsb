"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Dumbbell,
  Droplets,
  Coffee,
  Mail,
  Check,
  Clock,
  Activity,
  Flame,
  Plus,
  BookOpen,
  Code,
  Sparkles,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CreateHabitModal } from "@/modules/habits/components/create-habit-modal";
import { toggleHabitCompletionAction } from "@/modules/habits/habits.actions";
import type { HabitWithStreak } from "@/modules/habits/habits.types";

// ============================================================================
// Types & Interfaces
// ============================================================================

import type {
  HabitAccent,
  HabitWidgetItem,
} from "@/modules/dashboard/dashboard.types";
import {
  detectHabitIcon,
  mapHabitToWidgetItem,
} from "@/modules/dashboard/dashboard.utils";

export type { HabitAccent, HabitWidgetItem };
export { detectHabitIcon, mapHabitToWidgetItem };

export type TimelineActivity = HabitWidgetItem;
export type TimelineAccent = HabitAccent;

export interface HabitWidgetProps {
  initialHabits?: HabitWidgetItem[];
  defaultExpandedIds?: string[];
  className?: string;
  onToggleHabit?: (id: string, isCompleted: boolean) => void;
  onToggleExpand?: (id: string, isExpanded: boolean) => void;
}

export type DayTimelineProps = HabitWidgetProps;

function getExpandedHabitMap(
  habits: HabitWidgetItem[],
  defaultExpandedIds: string[]
): Record<string, boolean> {
  const expandedId = defaultExpandedIds[0] ?? habits.find((habit) => !habit.isCompleted)?.id;
  return expandedId ? { [expandedId]: true } : {};
}

// ============================================================================
// Accent Styles Lookup
// ============================================================================

interface AccentConfig {
  indicatorBg: string;
  indicatorText: string;
  indicatorCompletedBg: string;
  indicatorCompletedText: string;
  checkboxBorder: string;
  checkboxHover: string;
  checkboxCheckedBg: string;
  checkboxCheckedBorder: string;
}

const ACCENT_MAP: Record<string, AccentConfig> = {
  rose: {
    indicatorBg: "bg-[#e11d48]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#4c0519] border border-rose-500/30",
    indicatorCompletedText: "text-rose-200/80",
    checkboxBorder: "border-[#f43f5e]",
    checkboxHover: "hover:bg-rose-500/10",
    checkboxCheckedBg: "bg-[#e11d48]",
    checkboxCheckedBorder: "border-[#e11d48]",
  },
  sky: {
    indicatorBg: "bg-[#0ea5e9]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#082f49] border border-sky-500/30",
    indicatorCompletedText: "text-sky-200/80",
    checkboxBorder: "border-[#38bdf8]",
    checkboxHover: "hover:bg-sky-500/10",
    checkboxCheckedBg: "bg-[#0ea5e9]",
    checkboxCheckedBorder: "border-[#0ea5e9]",
  },
  blue: {
    indicatorBg: "bg-[#2563eb]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#172554] border border-blue-500/30",
    indicatorCompletedText: "text-blue-200/80",
    checkboxBorder: "border-[#60a5fa]",
    checkboxHover: "hover:bg-blue-500/10",
    checkboxCheckedBg: "bg-[#2563eb]",
    checkboxCheckedBorder: "border-[#2563eb]",
  },
  amber: {
    indicatorBg: "bg-[#f59e0b]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#451a03] border border-amber-500/30",
    indicatorCompletedText: "text-amber-200/80",
    checkboxBorder: "border-[#fbbf24]",
    checkboxHover: "hover:bg-amber-500/10",
    checkboxCheckedBg: "bg-[#f59e0b]",
    checkboxCheckedBorder: "border-[#f59e0b]",
  },
  orange: {
    indicatorBg: "bg-[#f97316]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#431407] border border-orange-500/30",
    indicatorCompletedText: "text-orange-200/80",
    checkboxBorder: "border-[#fb923c]",
    checkboxHover: "hover:bg-orange-500/10",
    checkboxCheckedBg: "bg-[#f97316]",
    checkboxCheckedBorder: "border-[#f97316]",
  },
  purple: {
    indicatorBg: "bg-[#a855f7]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#3b0764] border border-purple-500/30",
    indicatorCompletedText: "text-purple-200/80",
    checkboxBorder: "border-[#c084fc]",
    checkboxHover: "hover:bg-purple-500/10",
    checkboxCheckedBg: "bg-[#a855f7]",
    checkboxCheckedBorder: "border-[#a855f7]",
  },
  emerald: {
    indicatorBg: "bg-[#10b981]",
    indicatorText: "text-white",
    indicatorCompletedBg: "bg-[#022c22] border border-emerald-500/30",
    indicatorCompletedText: "text-emerald-200/80",
    checkboxBorder: "border-[#34d399]",
    checkboxHover: "hover:bg-emerald-500/10",
    checkboxCheckedBg: "bg-[#10b981]",
    checkboxCheckedBorder: "border-[#10b981]",
  },
};

// ============================================================================
// Default Habits (Fallback & Reference)
// ============================================================================

export const DEFAULT_HABIT_ITEMS: HabitWidgetItem[] = [
  {
    id: "workout",
    title: "Morning Workout",
    startTime: "07:45",
    endTime: "08:15",
    duration: "30 min",
    isCompleted: true,
    accentColor: "rose",
    icon: "workout",
  },
  {
    id: "shower",
    title: "Shower",
    startTime: "08:15",
    endTime: "08:30",
    duration: "15 min",
    isCompleted: false,
    accentColor: "sky",
    icon: "shower",
  },
  {
    id: "breakfast",
    title: "Breakfast",
    startTime: "08:30",
    endTime: "09:00",
    duration: "30 min",
    isCompleted: false,
    accentColor: "amber",
    icon: "breakfast",
  },
  {
    id: "email",
    title: "Check Email",
    startTime: "09:00",
    endTime: "09:15",
    duration: "15 min",
    isCompleted: false,
    accentColor: "purple",
    icon: "email",
  },
];

export const DEFAULT_TIMELINE_ACTIVITIES = DEFAULT_HABIT_ITEMS;

// ============================================================================
// Utility Helpers
// ============================================================================

function resolveHabitIcon(name: string): LucideIcon {
  const normalized = name.toLowerCase().trim();
  switch (normalized) {
    case "workout":
    case "gym":
    case "dumbbell":
    case "exercise":
      return Dumbbell;
    case "shower":
    case "droplets":
    case "bath":
    case "wash":
      return Droplets;
    case "breakfast":
    case "coffee":
    case "lunch":
    case "dinner":
    case "meal":
      return Coffee;
    case "email":
    case "mail":
    case "check email":
    case "messages":
      return Mail;
    case "book":
    case "read":
    case "study":
      return BookOpen;
    case "code":
    case "coding":
      return Code;
    case "sparkles":
    case "meditate":
      return Sparkles;
    case "moon":
    case "sleep":
      return Moon;
    case "flame":
    case "habit":
      return Flame;
    case "activity":
    case "run":
    case "walk":
      return Activity;
    default:
      return Clock;
  }
}

// ============================================================================
// Reusable Component: Habit Card
// ============================================================================

export interface HabitCardProps {
  habit: HabitWidgetItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export function HabitCard({
  habit,
  isExpanded,
  onToggle,
  onToggleExpand,
}: HabitCardProps) {
  const accent = ACCENT_MAP[habit.accentColor] || ACCENT_MAP.sky;
  const hasTime = Boolean(habit.startTime || habit.endTime);

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      onClick={() => onToggleExpand(habit.id)}
      className={cn(
        "group relative w-[240px] rounded-lg border border-neutral-800/80 bg-neutral-950/75 px-3.5 flex justify-between gap-2.5 transition-all duration-200 shadow-sm shrink-0 font-sans cursor-pointer select-none",
        isExpanded && hasTime
          ? "h-[72px] py-3 items-start"
          : "h-[44px] py-2.5 items-center hover:border-neutral-700/80 hover:bg-neutral-950/90",
        habit.isCompleted
          ? "opacity-60 hover:opacity-75"
          : "hover:border-neutral-700/80 hover:bg-neutral-950/90"
      )}
    >
      {/* Habit Details */}
      <div
        className={cn(
          "flex flex-col min-w-0 pr-1 font-sans",
          "justify-center h-full"
        )}
      >
        <h4
          className={cn(
            "text-[16px] font-bold tracking-tight leading-[1.2] font-sans truncate",
            habit.isCompleted
              ? "line-through text-neutral-400/80 decoration-neutral-400"
              : "text-white"
          )}
        >
          {habit.title}
        </h4>

        {isExpanded && (habit.startTime || habit.endTime) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mt-1.5 text-[12px] font-sans text-neutral-400 leading-tight"
          >
            {[habit.startTime, habit.endTime].filter(Boolean).join(" – ")}
            {habit.duration && <span className="ml-1 text-neutral-500">({habit.duration})</span>}
          </motion.p>
        )}

      </div>

      {/* Completion Checkbox (Visible when expanded) */}
      {isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(habit.id);
          }}
          className={cn(
            "shrink-0 w-5 h-5 rounded-[6px] flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 mt-0.5 animate-in fade-in-0 duration-150",
            habit.isCompleted
              ? cn(accent.checkboxCheckedBg, accent.checkboxCheckedBorder, "border text-white shadow-xs")
              : cn("bg-transparent border-[2px]", accent.checkboxBorder, accent.checkboxHover)
          )}
          aria-label={`Mark ${habit.title} as ${habit.isCompleted ? "incomplete" : "complete"}`}
        >
          {habit.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      )}
    </motion.div>
  );
}

export const TimelineActivityCard = HabitCard;

// ============================================================================
// Reusable Component: Indicator Block
// ============================================================================

export interface HabitIndicatorBlockProps {
  habit: HabitWidgetItem;
  isExpanded: boolean;
  onToggleExpand?: (id: string) => void;
}

export function HabitIndicatorBlock({
  habit,
  isExpanded,
  onToggleExpand,
}: HabitIndicatorBlockProps) {
  const accent = ACCENT_MAP[habit.accentColor] || ACCENT_MAP.sky;
  const Icon = resolveHabitIcon(habit.icon);
  const hasTime = Boolean(habit.startTime || habit.endTime);

  return (
    <div
      onClick={() => onToggleExpand?.(habit.id)}
      className={cn(
        "relative z-10 w-[38px] rounded-lg flex flex-col items-center transition-all duration-200 shadow-sm shrink-0 cursor-pointer select-none",
        isExpanded && hasTime ? "h-[72px] pt-3" : "h-[44px] justify-center",
        habit.isCompleted
          ? cn(accent.indicatorCompletedBg, accent.indicatorCompletedText)
          : cn(accent.indicatorBg, accent.indicatorText)
      )}
    >
      <Icon className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
    </div>
  );
}

export const TimelineIndicatorBlock = HabitIndicatorBlock;

// ============================================================================
// Main Habit Widget Component
// ============================================================================

export function HabitWidget({
  initialHabits = [],
  defaultExpandedIds = [],
  className,
  onToggleHabit,
  onToggleExpand,
}: HabitWidgetProps) {
  const router = useRouter();
  const [habits, setHabits] = React.useState<HabitWidgetItem[]>(initialHabits);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>(() =>
    getExpandedHabitMap(initialHabits, defaultExpandedIds)
  );

  // Keep habits in sync with prop updates
  React.useEffect(() => {
    setHabits(initialHabits);
    setExpandedIds(getExpandedHabitMap(initialHabits, defaultExpandedIds));
  }, [initialHabits]);

  // Real-time synchronization for habits created/updated anywhere in the app
  React.useEffect(() => {
    const handleCreated = (e: Event) => {
      const customEvent = e as CustomEvent<HabitWithStreak>;
      if (customEvent.detail) {
        setHabits((prev) => {
          if (prev.some((h) => h.id === customEvent.detail.id)) return prev;
          const newItem = mapHabitToWidgetItem(customEvent.detail, prev.length);
          return [...prev, newItem];
        });
      }
      router.refresh();
    };

    const handleUpdated = () => {
      router.refresh();
    };

    window.addEventListener("nsb:habit-created", handleCreated);
    window.addEventListener("nsb:habit-updated", handleUpdated);

    return () => {
      window.removeEventListener("nsb:habit-created", handleCreated);
      window.removeEventListener("nsb:habit-updated", handleUpdated);
    };
  }, [router]);

  const handleToggle = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const previousState = habit.isCompleted;
    const nextState = !previousState;

    // Optimistic local update
    setHabits((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, isCompleted: nextState };
        }
        return item;
      })
    );

    if (nextState) {
      const currentIndex = habits.findIndex((item) => item.id === id);
      const nextHabit = habits[currentIndex + 1];
      if (nextHabit) {
        setExpandedIds({ [nextHabit.id]: true });
        onToggleExpand?.(nextHabit.id, true);
      }
    }
    onToggleHabit?.(id, nextState);

    try {
      const res = await toggleHabitCompletionAction(id, previousState);
      if (!res.success) {
        // Rollback on failure
        setHabits((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isCompleted: previousState } : item
          )
        );
      } else {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nsb:habit-updated"));
        }
      }
    } catch {
      // Rollback on network/unhandled exception
      setHabits((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isCompleted: previousState } : item
        )
      );
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const nextState = !prev[id];
      onToggleExpand?.(id, nextState);
      return { ...prev, [id]: nextState };
    });
  };

  return (
    <div
      className={cn(
        "w-fit flex flex-col font-sans select-none",
        className
      )}
    >
      <div className="flex flex-col w-fit">
        {habits.length === 0 ? (
          /* ================================================================= */
          /* Empty State: Dotted border with Create Habit button matching card */
          /* ================================================================= */
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="relative flex items-center gap-2.5 group cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsCreateModalOpen(true);
              }
            }}
            aria-label="Create habit"
          >
            {/* Left: Indicator Block with Dotted Border */}
            <div
              className="relative z-10 w-[38px] h-[44px] rounded-lg border border-dashed border-neutral-700/80 group-hover:border-orange-500/60 bg-neutral-900/40 group-hover:bg-neutral-800/60 flex items-center justify-center transition-all duration-200 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4 text-neutral-400 group-hover:text-orange-400 group-hover:scale-110 transition-transform duration-200" />
            </div>

            {/* Right: Habit Card with Dotted Border */}
            <div
              className="relative w-[240px] h-[44px] rounded-lg border border-dashed border-neutral-700/80 group-hover:border-orange-500/60 bg-neutral-900/40 group-hover:bg-neutral-800/60 px-3.5 flex items-center justify-between gap-2.5 transition-all duration-200 shadow-sm shrink-0 font-sans"
            >
              <span className="text-[14px] font-medium text-neutral-300 group-hover:text-white transition-colors truncate">
                Create habit
              </span>
              <span className="shrink-0 text-[11px] font-mono uppercase tracking-wider text-orange-400/90 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 group-hover:bg-orange-500/20 group-hover:text-orange-300 transition-colors">
                + New
              </span>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* Habit List                                                        */
          /* ================================================================= */
          <div className="relative flex flex-col gap-2.5 py-8">
            {/* The day rail expands with the list; it is not tied to fixed clock hours. */}
            <div aria-hidden="true" className="absolute bottom-4 left-[18px] top-4 z-0 w-[2px] rounded-full bg-gradient-to-b from-amber-300/80 via-neutral-500/70 to-indigo-300/80 shadow-[0_0_8px_rgba(163,163,163,0.18)]" />
            <Sun aria-hidden="true" className="absolute -top-1 left-[7px] z-20 h-6 w-6 rounded-full border border-neutral-700 bg-neutral-900 p-1 text-amber-300 shadow-sm" />
            <Moon aria-hidden="true" className="absolute -bottom-1 left-[7px] z-20 h-6 w-6 rounded-full border border-neutral-700 bg-neutral-900 p-1 text-indigo-300 shadow-sm" />
            {habits.map((habit) => {
              const isExpanded = !!expandedIds[habit.id];

              return (
                <div
                  key={habit.id}
                  className="relative flex items-center gap-2.5 group"
                >
                  {/* 1. Left: Indicator Block with Icon */}
                  <HabitIndicatorBlock
                    habit={habit}
                    isExpanded={isExpanded}
                    onToggleExpand={handleToggleExpand}
                  />

                  {/* 2. Right: Habit Card */}
                  <HabitCard
                    habit={habit}
                    isExpanded={isExpanded}
                    onToggle={handleToggle}
                    onToggleExpand={handleToggleExpand}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(createdHabit) => {
          const newWidgetItem = mapHabitToWidgetItem(createdHabit, habits.length);
          setHabits((prev) => {
            if (prev.some((h) => h.id === newWidgetItem.id)) return prev;
            return [...prev, newWidgetItem];
          });
        }}
      />
    </div>
  );
}

export const DayTimeline = HabitWidget;
export default HabitWidget;
