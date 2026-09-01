export type ErrorCode =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown> | unknown[];

  constructor(
    message: string,
    code: ErrorCode = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown> | unknown[]
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entityName: string, id?: string) {
    const message = id
      ? `${entityName} with id '${id}' was not found.`
      : `${entityName} was not found.`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication is required to perform this action.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to access this resource.") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown> | unknown[]) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "A database error occurred.", details?: unknown) {
    super(
      message,
      "DATABASE_ERROR",
      500,
      typeof details === "object" && details !== null ? (details as Record<string, unknown>) : undefined
    );
    this.name = "DatabaseError";
  }
}
