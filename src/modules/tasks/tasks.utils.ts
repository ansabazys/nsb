import type { Task } from "./tasks.types";
import type { TaskPriority } from "@/types/database.types";
import { formatDateISO, getTodayDateString } from "@/lib/utils/date.utils";

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Checks if a task is overdue relative to a reference date
 */
export function isTaskOverdue(
  task: Pick<Task, "dueDate" | "status">,
  referenceDate: string | Date = new Date()
): boolean {
  if (!task.dueDate) return false;
  if (task.status === "completed" || task.status === "cancelled") return false;

  const dueStr = formatDateISO(task.dueDate);
  const refStr = formatDateISO(referenceDate);

  return dueStr < refStr;
}

/**
 * Checks if a task is due today
 */
export function isTaskDueToday(
  task: Pick<Task, "dueDate">,
  referenceDate: string | Date = getTodayDateString()
): boolean {
  if (!task.dueDate) return false;
  return formatDateISO(task.dueDate) === formatDateISO(referenceDate);
}

/**
 * Sorts tasks by priority (urgent -> high -> medium -> low) and due date (ascending)
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Priority comparison
    const weightA = PRIORITY_WEIGHTS[a.priority];
    const weightB = PRIORITY_WEIGHTS[b.priority];
    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // Due date comparison (earlier due dates first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Creation date fallback
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
