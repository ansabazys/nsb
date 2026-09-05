import type {
  DailyHabitsSummary,
  DailyTasksSummary,
  GoalsSummary,
} from "./dashboard.types";

/**
 * Calculates a composite daily productivity score (0 - 100) based on habit completions,
 * task completions, and goal progression.
 */
export function calculateDailyProductivityScore(
  habits: DailyHabitsSummary,
  tasks: DailyTasksSummary,
  goals: GoalsSummary
): number {
  let scoreComponents = 0;
  let totalWeight = 0;

  // Habit completion weight: 45%
  if (habits.totalCount > 0) {
    scoreComponents += habits.completionPercentage * 0.45;
    totalWeight += 0.45;
  }

  // Task completion weight: 35%
  if (tasks.totalCount > 0) {
    const taskPercentage = (tasks.completedCount / tasks.totalCount) * 100;
    scoreComponents += taskPercentage * 0.35;
    totalWeight += 0.35;
  }

  // Active goals progress weight: 20%
  if (goals.totalActiveCount > 0) {
    scoreComponents += goals.averageProgressPercentage * 0.2;
    totalWeight += 0.2;
  }

  if (totalWeight === 0) {
    return 100; // Fresh day with no scheduled tasks or habits yet
  }

  return Math.round(scoreComponents / totalWeight);
}

import type { HabitWithStreak } from "@/modules/habits/habits.types";
import type { HabitWidgetItem, HabitAccent } from "./dashboard.types";

export function detectHabitIcon(title: string): string {
  const t = title.toLowerCase();
  if (/workout|gym|dumbbell|lift|exercise|fitness|pushup|squat/.test(t)) return "workout";
  if (/run|running|walk|walking|jog|jogging|cardio|steps|cycle|cycling/.test(t)) return "activity";
  if (/shower|bath|wash|water|hydrate|drink/.test(t)) return "shower";
  if (/coffee|tea|breakfast|lunch|dinner|meal|food|eat|diet/.test(t)) return "coffee";
  if (/mail|email|inbox|message|reply/.test(t)) return "email";
  if (/read|book|study|learn|journal|write|diary|pages/.test(t)) return "book";
  if (/code|coding|dev|program|software/.test(t)) return "code";
  if (/meditat|mind|breathe|zen|pray|gratitude|relax/.test(t)) return "sparkles";
  if (/sleep|bed|rest|nap/.test(t)) return "moon";
  return "flame";
}

export function mapHabitToWidgetItem(
  habit: HabitWithStreak,
  index = 0
): HabitWidgetItem {
  const ACCENTS: HabitAccent[] = [
    "rose",
    "sky",
    "amber",
    "purple",
    "emerald",
    "orange",
    "blue",
  ];
  const accentColor = ACCENTS[index % ACCENTS.length];

  // A single time is shown as-is; a supplied range also receives a calculated duration.
  const timeMatch = habit.description?.match(
    /Time:\s*(\d{1,2}:\d{2})(?:\s*(?:-|–|to)\s*(\d{1,2}:\d{2}))?/i
  );
  let startTime = "";
  let endTime = "";
  let duration = "";

  if (timeMatch?.[1]) {
    const [startHours, startMinutes] = timeMatch[1].split(":").map(Number);
    startTime = `${String(startHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;

    if (timeMatch[2]) {
      const [endHours, endMinutes] = timeMatch[2].split(":").map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      let endTotalMinutes = endHours * 60 + endMinutes;
      if (endTotalMinutes < startTotalMinutes) endTotalMinutes += 24 * 60;

      endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
      const minutes = endTotalMinutes - startTotalMinutes;
      duration = minutes % 60 === 0 ? `${minutes / 60} hr` : `${minutes} min`;
    }
  }

  const iconKey = detectHabitIcon(habit.name);

  return {
    id: habit.id,
    title: habit.name,
    startTime,
    endTime,
    duration,
    isCompleted: Boolean(habit.streak?.isCompletedToday),
    accentColor,
    icon: iconKey,
  };
}
