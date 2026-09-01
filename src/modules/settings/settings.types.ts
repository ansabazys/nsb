export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  fullName?: string | null;
  avatarUrl?: string | null;
  timezone?: string;
}
