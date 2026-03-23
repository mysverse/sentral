"use client";

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { AnimateNumber } from "motion-plus/react";

import { humanise } from "utils/humanise";
import type { User } from "./types";

interface StatCardData {
  id: number;
  name: string;
  stat: string;
  numericStat?: number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}

function StatCard({ item, index }: { item: StatCardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6"
    >
      <dt>
        <div className={clsx("absolute rounded-md p-3", item.iconColor)}>
          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">
          {item.name}
        </p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
        {item.numericStat !== undefined ? (
          <AnimateNumber
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-2xl font-semibold text-gray-900"
          >
            {item.numericStat}
          </AnimateNumber>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
          <p className="text-sm font-normal text-gray-500">{item.subtitle}</p>
        </div>
      </dd>
    </motion.div>
  );
}

export default function StatCards({
  totalDuration,
  avgDuration,
  longest,
  shortest,
  topUser,
  activeCount,
  selectedDate,
  startTime,
  endTime
}: {
  totalDuration: number;
  avgDuration: number;
  longest: User | null;
  shortest: User | null;
  topUser: User | null;
  activeCount: number;
  selectedDate: string;
  startTime: string;
  endTime: string;
}) {
  const stats: StatCardData[] = [
    {
      id: 1,
      name: "Total Duty Duration",
      stat: humanise(totalDuration),
      subtitle: `On ${selectedDate}`,
      icon: ClockIcon,
      iconColor: "bg-blue-500"
    },
    {
      id: 2,
      name: "Average Session Duration",
      stat: humanise(avgDuration),
      subtitle: "Across all sessions",
      icon: ChartBarIcon,
      iconColor: "bg-indigo-500"
    },
    {
      id: 3,
      name: "Longest Session",
      stat: longest ? humanise(longest.dutyDuration) : "N/A",
      subtitle: longest ? `By @${longest.name.name}` : "No data",
      icon: ArrowTrendingUpIcon,
      iconColor: "bg-green-500"
    },
    {
      id: 4,
      name: "Shortest Session",
      stat: shortest ? humanise(shortest.dutyDuration) : "N/A",
      subtitle: shortest ? `By @${shortest.name.name}` : "No data",
      icon: ArrowTrendingDownIcon,
      iconColor: "bg-amber-500"
    },
    {
      id: 5,
      name: "Top Contributor",
      stat: topUser ? humanise(topUser.cumulativeDutyDuration) : "N/A",
      subtitle: topUser ? `@${topUser.name.name}` : "No data",
      icon: TrophyIcon,
      iconColor: "bg-yellow-500"
    },
    {
      id: 6,
      name: "Active Users",
      stat: `${activeCount}`,
      numericStat: activeCount,
      subtitle: `Between ${startTime} - ${endTime}`,
      icon: UserGroupIcon,
      iconColor: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item, index) => (
        <StatCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
