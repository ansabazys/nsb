import { NotFoundError, ValidationError } from "@/lib/errors/app-error";

export class GoalNotFoundError extends NotFoundError {
  constructor(goalId?: string) {
    super("Goal", goalId);
    this.name = "GoalNotFoundError";
  }
}

export class InvalidGoalProgressError extends ValidationError {
  constructor(message: string = "Invalid goal progress value.") {
    super(message);
    this.name = "InvalidGoalProgressError";
  }
}
