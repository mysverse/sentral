import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LogarithmicScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  LinearScale
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
  Tooltip
);

// ChartJS.defaults.font.family = "'JetBrains Mono', sans-serif";

export default function MECSChart() {
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
            }
          },
          y: {
            type: "logarithmic"
          }
        },
        indexAxis: "x",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true
          }
        }
      }}
      data={{
        labels: statsLast12Months.map((stat) => stat.time),
        datasets: [
          {
            label: "Granted",
            data: statsLast12Months.map((stat) => stat.granted),
            backgroundColor: "green",
            borderColor: "green"
          },
          {
            label: "Denied",
            data: statsLast12Months.map((stat) => stat.total - stat.granted),
            backgroundColor: "red",
            borderColor: "red"
          }
          // {
          //   label: "Total",
          //   data: statsLast12Months.map((stat) => stat.total),
          //   backgroundColor: "grey",
          //   borderColor: "grey"
          // }

          // {
          //   label: "Approval rate",
          //   data: statsLast12Months.map((stat) => stat.granted / stat.total),
          //   backgroundColor: "green",
          //   borderColor: "green"
          // }
        ]
      }}
    />
  );
}
