import { AppError, NotFoundError, ConflictError } from "@/lib/errors/app-error";

export class HabitNotFoundError extends NotFoundError {
  constructor(habitId?: string) {
    super("Habit", habitId);
    this.name = "HabitNotFoundError";
  }
}

export class HabitCompletionConflictError extends ConflictError {
  constructor(habitId: string, completedDate: string) {
    super(`Habit '${habitId}' has already been marked as completed for date ${completedDate}.`);
    this.name = "HabitCompletionConflictError";
  }
}

export class HabitArchivedError extends AppError {
  constructor(habitId: string) {
    super(`Cannot log completion for archived habit '${habitId}'.`, "CONFLICT", 409);
    this.name = "HabitArchivedError";
  }
}
