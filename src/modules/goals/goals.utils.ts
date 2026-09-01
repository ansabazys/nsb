import { getDaysDifference, getTodayDateString } from "@/lib/utils/date.utils";
import type { GoalProgressMetrics } from "./goals.types";
import type { GoalStatus } from "@/types/database.types";

/**
 * Calculates goal progress metrics including percentage, remaining target, and deadline urgency
 */
export function calculateGoalProgress(
  targetValue: number,
  currentValue: number,
  status: GoalStatus,
  deadline?: string | null,
  referenceDate: string | Date = getTodayDateString()
): GoalProgressMetrics {
  const safeTarget = Number(targetValue) > 0 ? Number(targetValue) : 1;
  const safeCurrent = Math.max(0, Number(currentValue));

  const rawPercentage = (safeCurrent / safeTarget) * 100;
  const percentage = Number(rawPercentage.toFixed(1));
  const remainingValue = Math.max(0, Number((safeTarget - safeCurrent).toFixed(2)));
  const isCompleted = status === "completed" || safeCurrent >= safeTarget;

  let daysRemaining: number | null = null;
  let isOverdue = false;

  if (deadline) {
    daysRemaining = getDaysDifference(referenceDate, deadline);
    if (daysRemaining < 0 && !isCompleted) {
      isOverdue = true;
    }
  }

  return {
    percentage,
    remainingValue,
    isCompleted,
    daysRemaining,
    isOverdue,
  };
}
