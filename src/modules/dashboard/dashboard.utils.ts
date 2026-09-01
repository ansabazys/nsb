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
