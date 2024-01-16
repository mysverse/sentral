import { InvoteStatsTimestamp } from "components/swr";
import { Bar } from "react-chartjs-2";
import {
  getStatsObject,
  getProgressiveGrayColour,
  getColourByName
} from "../_utils/chartUtils";

export default function VoteShareChart({
  stats
}: {
  stats: InvoteStatsTimestamp[];
}) {
  if (!stats) return null;

  const hidden = stats.some((item) => item.results.hidden);

  const statsObject = getStatsObject(stats);

  const newStats2 = Object.keys(statsObject).map((key) => ({
    name: key,
    stat: statsObject[key]
  }));

  return (
    // {/* chart won't scale properly without width class: https://stackoverflow.com/a/70191511 */}
    <div className="relative h-[8rem] w-[99%]">
      <Bar
        data={{
          labels: ["Votes"],
          datasets: newStats2.map((data, index) => ({
            barPercentage: 0.6,
            label: data.name !== "ROSAK" ? data.name : "Invalid",
            data: [data.stat],
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
