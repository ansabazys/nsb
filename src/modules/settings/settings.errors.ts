import { NotFoundError } from "@/lib/errors/app-error";

export class ProfileNotFoundError extends NotFoundError {
  constructor(userId?: string) {
    super("UserProfile", userId);
    this.name = "ProfileNotFoundError";
  }
}
