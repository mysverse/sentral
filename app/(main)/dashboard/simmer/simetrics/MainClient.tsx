"use client";

import { InboxIcon } from "@heroicons/react/24/outline";
import { Motion } from "components/motion";
import { motion } from "motion/react";
import { useQueryState } from "nuqs";
import { useState } from "react";

import DurationByRankChart from "./DurationByRankChart";
import DutyTimelineChart from "./DutyTimelineChart";
import FilterBar from "./FilterBar";
import SessionsPerUserChart from "./SessionsPerUserChart";
import StatCards from "./StatCards";
import SimetryTable from "./Table";
import type { User } from "./types";
import {
  activeUsersInTimeRange,
  averageDutyDuration,
  dutyDurationByRank,
  longestAndShortestDutySessions,
  sessionsPerUser,
  totalDutyDurationOnDate,
  userWithHighestCumulativeDuration
} from "./utils";

export default function MainClient({
  data,
  key
}: {
  data: User[];
  key?: string;
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${year}-${month}-${day}`;

  const [selectedDate, setSelectedDate] = useQueryState<string>("date", {
    defaultValue: defaultDate,
    parse: (value) => value,
    shallow: false
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Compute derived data
  const totalDuration = totalDutyDurationOnDate(data, selectedDate);
  const avgDuration = averageDutyDuration(data);
  const { longest, shortest } = longestAndShortestDutySessions(data);
  const topUser = userWithHighestCumulativeDuration(data);
  const rankDurations = dutyDurationByRank(data);
  const userSessions = sessionsPerUser(data);
  const activeCount = activeUsersInTimeRange(
    data,
    selectedDate,
    startTime,
    endTime
  );

  if (data.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <FilterBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          startTime={startTime}
          onStartTimeChange={setStartTime}
          endTime={endTime}
          onEndTimeChange={setEndTime}
          maxDate={defaultDate}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="flex flex-col items-center justify-center rounded-lg bg-white py-16 shadow-sm"
        >
          <InboxIcon className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No duty records found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No data available for {selectedDate}. Try selecting a different
            date.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <Motion
      key={key}
      className="grid grid-cols-1 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <FilterBar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        maxDate={defaultDate}
      />

      <StatCards
        totalDuration={totalDuration}
        avgDuration={avgDuration}
        longest={longest}
        shortest={shortest}
        topUser={topUser}
        activeCount={activeCount}
        selectedDate={selectedDate}
        startTime={startTime}
        endTime={endTime}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DurationByRankChart data={rankDurations} />
        <SessionsPerUserChart data={userSessions} />
      </div>

      <DutyTimelineChart data={data} selectedDate={selectedDate} />

      <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
        <SimetryTable dataset={data} />
      </div>
    </Motion>
  );
}
