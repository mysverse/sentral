import { InvoteSeats, InvoteStatsTimestamp } from "components/swr";
import {
  getStatsObject,
  calculateSeats,
  getSeatParties
} from "../_utils/chartUtils";
import SeatChart from "./SeatsChart";

export default function SeatsPieChart({
  stats,
  seatStats
}: {
  stats: InvoteStatsTimestamp[];
  seatStats: InvoteSeats[];
}) {
  if (!stats && !seatStats) return null;

  const statsObject = getStatsObject(stats);
  const seats = calculateSeats(statsObject);

  const parties: string[] = [];
  const sp = getSeatParties(stats, seatStats);

  if (sp) {
    for (const party of sp) {
      if (party && !parties.includes(party)) {
        parties.push(party);
      }
    }
  }

  const partyData =
    seatStats &&
    parties
      .map((party) => {
        return {
          name: party,
          votes: seatStats.filter((item) => item.party === party).length
        };
      })
      .sort((a, b) => b.votes - a.votes);

  return (
    <div className="flex justify-center">
      <SeatChart
        hidden={stats.some((item) => item.results.hidden)}
        dataset={
          partyData ??
          Object.keys(seats).map((key) => ({
            name: key,
            votes: seats[key]
          }))
        }
      />
    </div>
  );
}
