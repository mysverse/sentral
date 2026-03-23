"use client";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  Tooltip
} from "chart.js";
import "chartjs-adapter-date-fns";
import { motion } from "motion/react";

import type { User } from "./types";
import { removeDuplicates } from "./utils";

ChartJS.register(BarElement, CategoryScale, LinearScale, TimeScale, Tooltip);

interface TimelineBar {
  x: [Date, Date];
  y: string;
}

export default function DutyTimelineChart({
  data,
  selectedDate
}: {
  data: User[];
  selectedDate: string;
}) {
  if (data.length === 0) return null;

  // Get unique users sorted by cumulative duration, capped at 20
  const uniqueUsers = removeDuplicates(
    [...data].sort(
      (a, b) => b.cumulativeDutyDuration - a.cumulativeDutyDuration
    )
  ).slice(0, 20);

  const userNames = uniqueUsers.map((u) => `@${u.name.name}`);

  // Build floating bars for each duty session
  const timelineBars: TimelineBar[] = [];
  for (const entry of data) {
    const userName = `@${entry.name.name}`;
    if (!userNames.includes(userName)) continue;
    timelineBars.push({
      x: [new Date(entry.signOnTime), new Date(entry.signOffTime)],
      y: userName
    });
  }

  // Create the start and end of the selected date for axis bounds
  const dayStart = new Date(`${selectedDate}T00:00:00Z`);
  const dayEnd = new Date(`${selectedDate}T23:59:59Z`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.005 }}
      className="rounded-lg bg-white p-6 shadow-sm"
    >
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        Duty Timeline
      </h3>
      <p className="mb-4 text-xs text-gray-500">
        Showing when each user was on duty (top 20 by cumulative duration)
      </p>
      <div
        style={{
          height: Math.max(200, uniqueUsers.length * 28 + 60)
        }}
      >
        <Bar
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const raw = ctx.raw as { x: [Date, Date] };
                    if (!raw?.x) return "";
                    const start = raw.x[0].toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const end = raw.x[1].toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    return `${start} - ${end}`;
                  }
                }
              }
            },
            scales: {
              x: {
                type: "time",
                min: dayStart.getTime(),
                max: dayEnd.getTime(),
                time: {
                  unit: "hour",
                  displayFormats: {
                    hour: "HH:mm"
                  }
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.04)"
                }
              },
              y: {
                type: "category",
                labels: userNames,
                grid: {
                  display: false
                }
              }
            }
          }}
          data={{
            labels: userNames,
            datasets: [
              {
                label: "Duty",
                data: timelineBars as any,
                backgroundColor: "rgba(59, 130, 246, 0.6)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
                borderRadius: 3,
                borderSkipped: false,
                barPercentage: 0.7
              }
            ]
          }}
        />
      </div>
    </motion.div>
  );
}
