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
  Ticks,
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

export default function MECSChart2() {
  const { stats } = useTimeCaseStats(true);
  if (!stats) {
    return null;
  }
  const statsLast12Months = stats.slice(-13, -1);
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
              color: "rgba(0, 0, 0, 0.04)"
            }
          },
          y: {
            type: "logarithmic",
            ticks: {
              callback: function (value, index, ticks) {
                if (typeof value === "number") {
                  const formatterOutput =
                    Ticks.formatters.logarithmic.apply(this, [
                      value,
                      index,
                      ticks
                    ]);
                  if (formatterOutput.trim().length !== 0) {
                    return `${formatterOutput}%`;
                  }
                }
              }
            },
            grid: {
              color: "rgba(0, 0, 0, 0.04)"
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
            enabled: true,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";

                if (label) {
                  label += ": ";
                }

                if (context.parsed.y !== null) {
                  label += `${context.parsed.y.toFixed(2)}%`;
                }

                return label;
              }
            }
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
            label: "Approval rate",
            data: statsLast12Months.map(
              (stat) => (stat.granted / stat.total) * 100
            ),
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgba(59, 130, 246, 1)",
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
