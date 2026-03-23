"use client";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from "chart.js";
import { motion } from "motion/react";

import { humanise } from "utils/humanise";
import type { RankDuration } from "./types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function DurationByRankChart({
  data
}: {
  data: RankDuration[];
}) {
  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="rounded-lg bg-white p-6 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Duty Duration by Rank
      </h3>
      <div className="h-64">
        <Bar
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => humanise(ctx.raw as number)
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  callback: (value) => humanise(value as number)
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.04)"
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            }
          }}
          data={{
            labels: data.map((d) => d.rank),
            datasets: [
              {
                label: "Duration",
                data: data.map((d) => d.duration),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          }}
        />
      </div>
    </motion.div>
  );
}
