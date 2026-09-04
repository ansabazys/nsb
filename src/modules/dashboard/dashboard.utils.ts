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

  // Parse time from description if present e.g. "Time: 08:30"
  const timeMatch = habit.description?.match(/Time:\s*(\d{1,2}:\d{2})/i);
  let startTime = "";
  let endTime = "";
  let duration = "30 min";

  if (timeMatch && timeMatch[1]) {
    const rawTime = timeMatch[1];
    const [hStr, mStr] = rawTime.split(":");
    let hours = parseInt(hStr, 10);
    let minutes = parseInt(mStr, 10);
    startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    // Add 30 mins for end time
    minutes += 30;
    if (minutes >= 60) {
      hours = (hours + 1) % 24;
      minutes = minutes - 60;
    }
    endTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } else {
    // If no explicit time was set, create a sequential time slot starting at 07:30
    const startHour = (7 + Math.floor((index * 45) / 60)) % 24;
    const startMin = (index * 45) % 60;
    const endTotalMin = startHour * 60 + startMin + 30;
    const endHour = Math.floor(endTotalMin / 60) % 24;
    const endMin = endTotalMin % 60;

    startTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
    endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
    duration = "30 min";
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

