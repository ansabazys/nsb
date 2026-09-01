import type { TaskStatus, TaskPriority } from "@/types/database.types";

export interface Task {
  id: string;
  userId: string;
  goalId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  goalId?: string;
  isOverdue?: boolean;
  dueToday?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  goalId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  goalId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}
