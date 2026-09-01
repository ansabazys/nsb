import {
  formatDateISO,
  getDaysDifference,
  addDays,
} from "@/lib/utils/date.utils";
import type { HabitStreak } from "./habits.types";

/**
 * Calculates streak metrics for a habit based on its historical completion dates.
 *
 * @param completionDates Array of completed dates (ISO date string YYYY-MM-DD or Date objects)
 * @param habitCreatedAt Date string or Date when the habit was created
 * @param referenceDate Optional reference date (defaults to today)
 */
export function calculateHabitStreak(
  completionDates: (string | Date)[],
  habitCreatedAt?: string | Date,
  referenceDate: string | Date = new Date()
): HabitStreak {
  const todayStr = formatDateISO(referenceDate);

  if (!completionDates || completionDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      isCompletedToday: false,
      completionRate: 0,
      lastCompletedDate: null,
    };
  }

  // Normalize, deduplicate, and sort completion dates ascending
  const uniqueDatesSet = new Set<string>();
  for (const date of completionDates) {
    uniqueDatesSet.add(formatDateISO(date));
  }
  const sortedDates = Array.from(uniqueDatesSet).sort();

  const totalCompletions = sortedDates.length;
  const isCompletedToday = sortedDates.includes(todayStr);
  const lastCompletedDate = sortedDates[sortedDates.length - 1] ?? null;

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = isCompletedToday ? todayStr : addDays(todayStr, -1);

  // If yesterday is also not completed and today is not completed, current streak is 0
  if (!isCompletedToday && !sortedDates.includes(checkDate)) {
    currentStreak = 0;
  } else {
    while (sortedDates.includes(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  }

  // Calculate longest streak across entire history
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const date of sortedDates) {
    if (previousDate === null) {
      runningStreak = 1;
    } else {
      const diff = getDaysDifference(previousDate, date);
      if (diff === 1) {
        runningStreak++;
      } else if (diff > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    previousDate = date;
  }

  // Calculate completion rate based on habit active duration
  let completionRate = 100;
  if (habitCreatedAt) {
    const createdDateStr = formatDateISO(habitCreatedAt);
    const totalDaysActive = Math.max(1, getDaysDifference(createdDateStr, todayStr) + 1);
    completionRate = Math.min(100, Math.round((totalCompletions / totalDaysActive) * 100));
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    isCompletedToday,
    completionRate,
    lastCompletedDate,
  };
}
