import type { User, RankDuration, UserSessionCount } from "./types";

export function removeDuplicates(arr: User[]): User[] {
  const seen = new Set<number>();
  return arr.filter((obj) => {
    const keyValue = obj.name.userId;
    if (seen.has(keyValue)) {
      return false;
    } else {
      seen.add(keyValue);
      return true;
    }
  });
}

export function filterTestLocations(data: User[]): User[] {
  return data.filter((obj) => !obj.location.includes("Test"));
}

export function totalDutyDurationOnDate(data: User[], date: string): number {
  return data
    .filter((entry) => entry.signOnTime.startsWith(date))
    .reduce((total, entry) => total + entry.dutyDuration, 0);
}

export function averageDutyDuration(data: User[]): number {
  const totalDuration = data.reduce(
    (total, entry) => total + entry.dutyDuration,
    0
  );
  return totalDuration / data.length || 0;
}

export function longestAndShortestDutySessions(data: User[]) {
  if (data.length === 0) {
    return { longest: null, shortest: null };
  }
  const sortedData = [...data].sort((a, b) => b.dutyDuration - a.dutyDuration);
  return {
    longest: sortedData[0],
    shortest: sortedData[sortedData.length - 1]
  };
}

export function userWithHighestCumulativeDuration(data: User[]): User | null {
  if (data.length === 0) return null;
  return data.reduce(
    (max, entry) =>
      entry.cumulativeDutyDuration > max.cumulativeDutyDuration ? entry : max,
    data[0]
  );
}

export function dutyDurationByRank(data: User[]): RankDuration[] {
  const acc: Record<string, number> = {};
  for (const entry of data) {
    const rank = entry.rank || "Unknown";
    acc[rank] = (acc[rank] || 0) + entry.dutyDuration;
  }
  return Object.entries(acc)
    .map(([rank, duration]) => ({ rank, duration }))
    .sort((a, b) => b.duration - a.duration);
}

export function activeUsersInTimeRange(
  data: User[],
  date: string,
  startTime: string,
  endTime: string
): number {
  const startDateTime = new Date(`${date}T${startTime}:00Z`).getTime();
  const endDateTime = new Date(`${date}T${endTime}:00Z`).getTime();
  return data.filter((entry) => {
    const signOn = new Date(entry.signOnTime).getTime();
    const signOff = new Date(entry.signOffTime).getTime();
    return signOn <= endDateTime && signOff >= startDateTime;
  }).length;
}

export function sessionsPerUser(data: User[]): UserSessionCount[] {
  const acc: Record<number, { name: string; count: number }> = {};
  for (const entry of data) {
    const userId = entry.name.userId;
    if (!acc[userId]) {
      acc[userId] = { name: entry.name.name, count: 0 };
    }
    acc[userId].count += 1;
  }
  return Object.entries(acc)
    .map(([userId, { name, count }]) => ({
      userId: parseInt(userId),
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeUserAggregates(data: User[]) {
  const avgMap = new Map<number, number>();
  const totalSessionsMap = new Map<number, number>();

  for (const obj of data) {
    const userId = obj.name.userId;
    const userData = data.filter((d) => d.name.userId === userId);
    const total = userData.length;
    const totalDuration = userData.reduce(
      (sum, entry) => sum + entry.dutyDuration,
      0
    );
    avgMap.set(userId, totalDuration / total);
    totalSessionsMap.set(userId, total);
  }

  return { avgMap, totalSessionsMap };
}
