import React from "react";
import SimetryTable from "./Table";

export const metadata = {
  title: "Simetry"
};

export interface User {
  name: {
    name: string;
    userId: number;
  };
  rank?: string;
  signOnTime: string; // ISO date string
  signOffTime: string; // ISO date string
  dutyDuration: number; // in seconds
  cumulativeDutyDuration: number; // in seconds
  location: string;
}

export default async function Main() {
  const response = await fetch(
    "https://mysverse-webhook-data.yan3321.workers.dev/614134433204797466",
    { next: { revalidate: 60 } }
  );

  const data: User[] = await response.json();

  // Utility functions
  const totalDutyDurationOnDate = (data: User[], date: string): number => {
    return data
      .filter((entry) => entry.signOnTime.startsWith(date))
      .reduce((total, entry) => total + entry.dutyDuration, 0);
  };

  const averageDutyDuration = (data: User[]): number => {
    const totalDuration = data.reduce(
      (total, entry) => total + entry.dutyDuration,
      0
    );
    return totalDuration / data.length;
  };

  const longestAndShortestDutySessions = (data: User[]) => {
    const sortedData = [...data].sort(
      (a, b) => b.dutyDuration - a.dutyDuration
    );
    return {
      longest: sortedData[0],
      shortest: sortedData[sortedData.length - 1]
    };
  };

  const userWithHighestCumulativeDuration = (data: User[]): User => {
    return data.reduce(
      (max, entry) =>
        entry.cumulativeDutyDuration > max.cumulativeDutyDuration ? entry : max,
      data[0]
    );
  };

  const dutyDurationByRank = (data: User[]): Record<string, number> => {
    return data.reduce(
      (acc, entry) => {
        const rank = entry.rank || "Unknown";
        acc[rank] = (acc[rank] || 0) + entry.dutyDuration;
        return acc;
      },
      {} as Record<string, number>
    );
  };

  const activeUsersInTimeRange = (
    data: User[],
    startTime: string,
    endTime: string
  ): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return data.filter((entry) => {
      const signOn = new Date(entry.signOnTime).getTime();
      const signOff = new Date(entry.signOffTime).getTime();
      return signOn <= end && signOff >= start;
    }).length;
  };

  const sessionsPerUser = (data: User[]): Record<number, number> => {
    return data.reduce(
      (acc, entry) => {
        const userId = entry.name.userId;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
  };

  const totalDuration = totalDutyDurationOnDate(data, "2024-10-11");
  const avgDuration = averageDutyDuration(data).toFixed(2);
  const { longest, shortest } = longestAndShortestDutySessions(data);
  const topUser = userWithHighestCumulativeDuration(data);
  const durationByRank = dutyDurationByRank(data);
  const activeCount = activeUsersInTimeRange(
    data,
    "2024-10-11T09:00:00Z",
    "2024-10-11T10:00:00Z"
  );
  const userSessions = sessionsPerUser(data);
  return (
    <>
      <SimetryTable dataset={data} />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">
            Total Duty Duration on 2024-10-11
          </h2>
          <p className="mt-2 text-gray-700">{totalDuration} seconds</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">Average Duty Duration</h2>
          <p className="mt-2 text-gray-700">{avgDuration} seconds</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">Longest Duty Session</h2>
          <p className="mt-2 text-gray-700">
            {longest.name.name} - {longest.dutyDuration} seconds
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">Shortest Duty Session</h2>
          <p className="mt-2 text-gray-700">
            {shortest.name.name} - {shortest.dutyDuration} seconds
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">
            Top User by Cumulative Duration
          </h2>
          <p className="mt-2 text-gray-700">
            {topUser.name.name} - {topUser.cumulativeDutyDuration} seconds
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">
            Active Users Between 09:00 - 10:00
          </h2>
          <p className="mt-2 text-gray-700">{activeCount} users</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">Sessions per User</h2>
          <pre className="mt-2 text-gray-700">
            {JSON.stringify(userSessions, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="text-lg font-semibold">Duty Duration by Rank</h2>
          <pre className="mt-2 text-gray-700">
            {JSON.stringify(durationByRank, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}
