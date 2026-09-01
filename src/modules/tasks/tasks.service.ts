import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { TasksRepository } from "./tasks.repository";
import { CreateTaskSchema, UpdateTaskSchema, TaskIdSchema } from "./tasks.schema";
import { TaskNotFoundError } from "./tasks.errors";
import { sortTasks, isTaskDueToday, isTaskOverdue } from "./tasks.utils";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterOptions,
} from "./tasks.types";

export class TasksService {
  private readonly repository: TasksRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repository = new TasksRepository(supabase);
  }

  async getTaskById(taskId: string, userId: string): Promise<Task> {
    TaskIdSchema.parse(taskId);
    const task = await this.repository.findById(taskId, userId);
    if (!task) {
      throw new TaskNotFoundError(taskId);
    }
    return task;
  }

  async getUserTasks(userId: string, filters?: TaskFilterOptions): Promise<Task[]> {
    const tasks = await this.repository.findAllByUser(userId, filters);
    let filtered = tasks;

    if (filters?.isOverdue) {
      filtered = filtered.filter((t) => isTaskOverdue(t));
    }

    if (filters?.dueToday) {
      filtered = filtered.filter((t) => isTaskDueToday(t));
    }

    return sortTasks(filtered);
  }

  async getTodayTasks(userId: string): Promise<{
    tasks: Task[];
    totalCount: number;
    completedCount: number;
    pendingCount: number;
  }> {
    const allTasks = await this.repository.findAllByUser(userId);

    // Tasks that are either due today or overdue and not completed, or already completed today
    const todayTasks = allTasks.filter(
      (task) => isTaskDueToday(task) || isTaskOverdue(task)
    );

    const sorted = sortTasks(todayTasks);
    const completedCount = sorted.filter((t) => t.status === "completed").length;
    const pendingCount = sorted.filter(
      (t) => t.status === "pending" || t.status === "in_progress"
    ).length;

    return {
      tasks: sorted,
      totalCount: sorted.length,
      completedCount,
      pendingCount,
    };
  }

  async createTask(userId: string, rawInput: CreateTaskInput): Promise<Task> {
    const validated = CreateTaskSchema.parse(rawInput);
    return await this.repository.create(userId, validated);
  }

  async updateTask(
    taskId: string,
    userId: string,
    rawInput: UpdateTaskInput
  ): Promise<Task> {
    TaskIdSchema.parse(taskId);
    const validated = UpdateTaskSchema.parse(rawInput);

    const existing = await this.repository.findById(taskId, userId);
    if (!existing) {
      throw new TaskNotFoundError(taskId);
    }

    const updated = await this.repository.update(taskId, userId, validated);
    if (!updated) {
      throw new TaskNotFoundError(taskId);
    }

    return updated;
  }

  async setTaskStatus(
    taskId: string,
    userId: string,
    status: Task["status"]
  ): Promise<Task> {
    return await this.updateTask(taskId, userId, { status });
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    TaskIdSchema.parse(taskId);
    const existing = await this.repository.findById(taskId, userId);
    if (!existing) {
      throw new TaskNotFoundError(taskId);
    }
    return await this.repository.delete(taskId, userId);
  }
}
