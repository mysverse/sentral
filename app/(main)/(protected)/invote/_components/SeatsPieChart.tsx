import { InvoteStatsTimestamp } from "components/swr";
import { getStatsObject, calculateSeats } from "../_utils/chartUtils";
import SeatChart from "./SeatsChart";

export default function SeatsPieChart({
  stats
}: {
  stats: InvoteStatsTimestamp[];
}) {
  if (!stats) return null;

  const statsObject = getStatsObject(stats);
  const seats = calculateSeats(statsObject);

  return (
    <div className="flex justify-center">
      <SeatChart
        hidden={stats.some((item) => item.results.hidden)}
        dataset={Object.keys(seats).map((key) => ({
          name: key,
          votes: seats[key]
        }))}
      />
    </div>
  );
}
