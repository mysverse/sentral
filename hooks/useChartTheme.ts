"use client";

import { Chart as ChartJS } from "chart.js";
import { useTheme } from "next-themes";
import { useEffect } from "react";

// Chart.js colors that follow the app theme. Use in chart options:
// scales: { x: { ticks: { color: textColor }, grid: { color: gridColor } } }
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    dark,
    textColor: dark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
    gridColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"
  };
}

// Call once in any chart component: keeps Chart.js global defaults (legend,
// tick and grid colors) in sync with the active theme and repaints live charts
export function useChartThemeSync() {
  const { textColor, gridColor } = useChartTheme();
  useEffect(() => {
    ChartJS.defaults.color = textColor;
    ChartJS.defaults.borderColor = gridColor;
    for (const chart of Object.values(ChartJS.instances)) {
      chart?.update("none");
    }
  }, [textColor, gridColor]);
}
