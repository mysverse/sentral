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
  ScriptableLineSegmentContext
} from "chart.js";

import "chartjs-adapter-date-fns";

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

const skipped = (ctx: ScriptableLineSegmentContext, value: any) =>
  ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx: ScriptableLineSegmentContext, value: any) =>
  ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

export default function GrowthChart({
  chartData,
  logarithmic,
  loading
}: {
  chartData: {
    labels: number[] | undefined;
    data: number[];
    increment: "day" | "week" | "month";
  };
  logarithmic: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-48 w-48 animate-spin rounded-full border-b-8 border-blue-600"></div>
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
              unit: chartData.increment,
              tooltipFormat: "dd MMMM yyyy",
              round: chartData.increment
            }
          },
          y: {
            type: logarithmic ? "logarithmic" : "linear"
          }
        },
        indexAxis: "x",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true
          }
        },
        onResize: (chart, size) => {
          const showTicks = size.width < 640 ? false : true;
          if (chart.options.scales?.y) {
            if (chart.options.scales.y.ticks) {
              chart.options.scales.y.ticks.display = showTicks;
            }
          }
        }
      }}
      data={{
        labels: chartData.labels,
        datasets: [
          {
            label: "Member count",
            borderColor: "#2563eb",
            segment: {
              borderColor: (ctx) =>
                skipped(ctx, "rgb(0,0,0,0.2)") || down(ctx, "#2563eb"),
              borderDash: (ctx) => skipped(ctx, [6, 6])
            },
            spanGaps: true,
            data: chartData.data
          }
        ]
      }}
    />
  );
}
