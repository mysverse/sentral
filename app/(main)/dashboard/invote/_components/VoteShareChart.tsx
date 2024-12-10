import { InvoteStatsTimestamp } from "components/swr";
import { Bar } from "react-chartjs-2";
import {
  getStatsObject,
  getProgressiveGrayColour,
  getColourByName
} from "../_utils/chartUtils";
import { useInView } from "motion/react";
import { useRef } from "react";
export default function VoteShareChart({
  stats
}: {
  stats: InvoteStatsTimestamp[];
}) {
  if (!stats) return null;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const hidden = stats.some((item) => item.results.hidden);

  const statsObject = getStatsObject(stats);

  const newStats2 = Object.keys(statsObject)
    .map((key) => ({
      name: key,
      stat: statsObject[key]
    }))
    .sort((a, b) => b.stat - a.stat);

  return (
    // {/* chart won't scale properly without width class: https://stackoverflow.com/a/70191511 */}
    <div className="relative h-[8rem] w-[99%]" ref={ref}>
      <Bar
        data={{
          labels: ["Votes"],
          datasets: newStats2.map((data, index) => ({
            barPercentage: 0.6,
            label: data.name !== "ROSAK" ? data.name : "Invalid",
            data: isInView ? [data.stat] : [],
            backgroundColor: hidden
              ? getProgressiveGrayColour(index, newStats2.length)
              : getColourByName(data.name),
            borderRadius: 6
          }))
        }}
        options={{
          indexAxis: "y",
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              ticks: {
                display: false
              },
              grid: {
                display: false
              }
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }}
      />
    </div>
  );
}
