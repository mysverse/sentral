"use client";

import { useChartThemeSync } from "hooks/useChartTheme";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip
} from "chart.js";
import { motion } from "motion/react";

import type { UserSessionCount } from "./types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function SessionsPerUserChart({
  data
}: {
  data: UserSessionCount[];
}) {
  useChartThemeSync();

  const top10 = data.slice(0, 10);

  if (top10.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="bg-surface rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-strong mb-1 text-sm font-semibold">
        Sessions per User
      </h3>
      <p className="text-muted mb-4 text-xs">Showing top 10</p>
      <div className="h-64">
        <Bar
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.raw} sessions`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                },
                grid: {
                  color: "rgba(127, 127, 127, 0.12)"
                }
              }
            }
          }}
          data={{
            labels: top10.map((d) => `@${d.name}`),
            datasets: [
              {
                label: "Sessions",
                data: top10.map((d) => d.count),
                backgroundColor: "rgba(99, 102, 241, 0.7)",
                borderColor: "rgba(99, 102, 241, 1)",
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
