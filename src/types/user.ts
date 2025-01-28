export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserProfile {
  userId: number;
  bio: string;
  avatarUrl: string;
}
