export interface User {
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
}

export interface RaceLeaderboard {
  user: User;
  image: string;
  time: number;
}
