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

import GrowthUtils from "components/growthUtils";

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

export default function GrowthChart({
  growthUtils,
  logarithmic,
  displayOption
}: {
  growthUtils: GrowthUtils;
  logarithmic: boolean;
  displayOption: string;
}) {
  return (
    <Line
      options={{
        scales: {
          x: {
            type: "time",
            time: {
              // unit: "month",
              tooltipFormat: "dd MMMM yyyy"
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
      data={growthUtils.getLineChartData(displayOption)}
    />
  );
}
