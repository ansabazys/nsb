/**
 * Standard Server Action Result Structure
 */
export type FieldErrors = Record<string, string[] | undefined>;

export interface ActionSuccess<T = void> {
  success: true;
  data: T;
  message?: string;
}

export interface ActionError {
  success: false;
  error: string;
  fieldErrors?: FieldErrors;
}

export type ActionResult<T = void> = ActionSuccess<T> | ActionError;
