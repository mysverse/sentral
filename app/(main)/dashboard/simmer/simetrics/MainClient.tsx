"use client";

import { useState } from "react";
import { User } from "./page";
import humanizeDuration from "humanize-duration";
import SimetryTable from "./Table";

function humanise(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    units: ["mo", "d", "h", "m", "s"],
    round: true,
    unitMeasures: {
      y: 31557600000,
      mo: 30 * 86400000,
      w: 604800000,
      d: 86400000,
      h: 3600000,
      m: 60000,
      s: 1000,
      ms: 1
    }
  });
}

export default function MainClient({ data }: { data: User[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${year}-${month}-${day}`;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

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
    return totalDuration / data.length || 0;
  };

  const longestAndShortestDutySessions = (data: User[]) => {
    if (data.length === 0) {
      return { longest: null, shortest: null };
    }
    const sortedData = [...data].sort(
      (a, b) => b.dutyDuration - a.dutyDuration
    );
    return {
      longest: sortedData[0],
      shortest: sortedData[sortedData.length - 1]
    };
  };

  const userWithHighestCumulativeDuration = (data: User[]): User | null => {
    if (data.length === 0) return null;
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
    date: string,
    startTime: string,
    endTime: string
  ): number => {
    const startDateTime = new Date(`${date}T${startTime}:00Z`).getTime();
    const endDateTime = new Date(`${date}T${endTime}:00Z`).getTime();
    return data.filter((entry) => {
      const signOn = new Date(entry.signOnTime).getTime();
      const signOff = new Date(entry.signOffTime).getTime();
      return signOn <= endDateTime && signOff >= startDateTime;
    }).length;
  };

  const sessionsPerUser = (data: User[]): Record<string, number> => {
    return data.reduce(
      (acc, entry) => {
        const userId = entry.name.userId;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  };

  const filteredDataByDate = data.filter((entry) =>
    entry.signOnTime.startsWith(selectedDate)
  );

  const totalDuration = totalDutyDurationOnDate(data, selectedDate);
  console.log(totalDuration);
  const avgDuration = averageDutyDuration(filteredDataByDate);
  const { longest, shortest } =
    longestAndShortestDutySessions(filteredDataByDate);
  const topUser = userWithHighestCumulativeDuration(filteredDataByDate);
  const durationByRank = dutyDurationByRank(filteredDataByDate);
  const activeCount = activeUsersInTimeRange(
    data,
    selectedDate,
    startTime,
    endTime
  );

  const userSessions = sessionsPerUser(filteredDataByDate);

  const getNameFromId = (userId: string) =>
    data.find((entry) => entry.name.userId === parseInt(userId))?.name.name ||
    "Unknown";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-lg bg-white px-4 py-4 shadow sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-6">
          <div className="flex flex-col gap-2 sm:w-full sm:flex-row sm:items-center">
            <label className="block text-sm font-medium text-gray-700">
              Select date
            </label>
            <input
              type="date"
              value={selectedDate}
              max={defaultDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded border border-gray-400 p-2"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-full sm:flex-row sm:items-center">
            <label className="block text-sm font-medium text-gray-700">
              Start time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded border border-gray-400 p-2"
            />
          </div>
          <div className="flex flex-col gap-2 sm:w-full sm:flex-row sm:items-center">
            <label className="block text-sm font-medium text-gray-700">
              End time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded border border-gray-400 p-2"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white px-4 py-4 shadow sm:px-6">
        <SimetryTable dataset={filteredDataByDate} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="font-semibold">
            Total Duty Duration on {selectedDate}
          </h2>
          <p className="mt-2 text-gray-700">{humanise(totalDuration)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="font-semibold">Average Duty Duration</h2>
          <p className="mt-2 text-gray-700">{humanise(avgDuration)}</p>
        </div>
        {longest && (
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h2 className="font-semibold">Longest Duty Session</h2>
            <p className="mt-2 text-gray-700">
              {longest.name.name} - {humanise(longest.dutyDuration)}
            </p>
          </div>
        )}
        {shortest && (
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h2 className="font-semibold">Shortest Duty Session</h2>
            <p className="mt-2 text-gray-700">
              {shortest.name.name} - {humanise(shortest.dutyDuration)}
            </p>
          </div>
        )}
        {topUser && (
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <h2 className="font-semibold">Top User by Cumulative Duration</h2>
            <p className="mt-2 text-gray-700">
              {topUser.name.name} - {humanise(topUser.cumulativeDutyDuration)}
            </p>
          </div>
        )}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="font-semibold">
            Active Users Between {startTime} - {endTime}
          </h2>
          <p className="mt-2 text-gray-700">{activeCount} users</p>
        </div>
        <div className="overflow-x-auto rounded-lg bg-white p-4 shadow-lg">
          <h2 className="font-semibold">Sessions per User</h2>
          <ul className="mt-2 text-gray-700">
            {Object.values(userSessions)
              .sort((a, b) => b - a)
              .map((count, idx) => {
                return (
                  <li key={idx}>
                    {count} - @{getNameFromId(Object.keys(userSessions)[idx])}
                  </li>
                );
              })}
            {/* {JSON.stringify(userSessions, null, 2)} */}
          </ul>
        </div>
        <div className="overflow-x-auto rounded-lg bg-white p-4 shadow-lg">
          <h2 className="font-semibold">Duty Duration by Rank</h2>
          <ul className="mt-2 text-gray-700">
            {Object.values(durationByRank)
              .sort((a, b) => b - a)
              .map((count, idx) => {
                return (
                  <li key={idx}>
                    {humanise(count)} - {Object.keys(durationByRank)[idx]}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
