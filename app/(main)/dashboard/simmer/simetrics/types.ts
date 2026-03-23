export interface User {
  name: {
    name: string;
    userId: number;
  };
  rank?: string;
  signOnTime: string;
  signOffTime: string;
  dutyDuration: number;
  cumulativeDutyDuration: number;
  location: string;
}

export interface RankDuration {
  rank: string;
  duration: number;
}

export interface UserSessionCount {
  userId: number;
  name: string;
  count: number;
}
