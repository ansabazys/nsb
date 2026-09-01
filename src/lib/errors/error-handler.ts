import { AppError } from "./app-error";
import { ZodError } from "zod";

export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type Result<T> = SuccessResponse<T> | ErrorResponse;

export function formatError(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        name: error.name,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        name: "ValidationError",
        code: "VALIDATION_ERROR",
        message: "Invalid input payload",
        statusCode: 400,
        details: error.flatten(),
      },
    };
  }

  const genericMessage =
    error instanceof Error ? error.message : "An unexpected internal server error occurred.";

  return {
    success: false,
    error: {
      name: "InternalError",
      code: "INTERNAL_ERROR",
      message: genericMessage,
      statusCode: 500,
    },
  };
}

export function createSuccess<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}
