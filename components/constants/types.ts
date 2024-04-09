export interface User {
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
}

export interface Leaderboard {
  user: User;
  image: string;
  time?: number;
  score?: number;
}
