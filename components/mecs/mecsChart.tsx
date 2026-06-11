import { useChartThemeSync } from "hooks/useChartTheme";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LogarithmicScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  LinearScale,
  Filler,
  Legend
} from "chart.js";

import "chartjs-adapter-date-fns";

import { useTimeCaseStats } from "components/swr";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend
);

export default function MECSChart() {
  useChartThemeSync();

  const { stats, isError } = useTimeCaseStats(true);
  if (isError) {
    return (
      <div className="text-muted flex h-full items-center justify-center text-sm">
        Unable to load membership trend data.
      </div>
    );
  }

  if (!stats) {
    return null;
  }
  const statsLast12Months = stats
    .filter(
      (stat) =>
        typeof stat.time === "string" &&
        typeof stat.granted === "number" &&
        typeof stat.total === "number"
    )
    .slice(-13, -1);

  if (statsLast12Months.length === 0) {
    return (
      <div className="text-muted flex h-full items-center justify-center text-sm">
        No membership trend data is available.
      </div>
    );
  }

  return (
    <Line
      options={{
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
              tooltipFormat: "MMMM yyyy"
            },
            grid: {
              color: "rgba(127, 127, 127, 0.12)"
            }
          },
          y: {
            type: "logarithmic",
            grid: {
              color: "rgba(127, 127, 127, 0.12)"
            }
          }
        },
        indexAxis: "x",
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 800,
          easing: "easeOutQuart"
        },
        plugins: {
          tooltip: {
            enabled: true
          },
          legend: {
            display: true,
            position: "top" as const
          }
        }
      }}
      data={{
        labels: statsLast12Months.map((stat) => stat.time),
        datasets: [
          {
            label: "Granted",
            data: statsLast12Months.map((stat) => stat.granted),
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          },
          {
            label: "Denied",
            data: statsLast12Months.map((stat) => stat.total - stat.granted),
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          }
        ]
      }}
    />
  );
}
