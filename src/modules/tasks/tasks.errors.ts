import { NotFoundError } from "@/lib/errors/app-error";

export class TaskNotFoundError extends NotFoundError {
  constructor(taskId?: string) {
    super("Task", taskId);
    this.name = "TaskNotFoundError";
  }
}
