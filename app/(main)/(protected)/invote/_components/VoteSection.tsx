import { InvoteStatsTimestamp } from "components/swr";
import { useState, useEffect } from "react";
import VoteChart from "./VoteChart";

export default function VoteSection({
  stats
}: {
  stats: InvoteStatsTimestamp[];
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setHidden(!hidden), 1500);
    return () => {
      clearInterval(interval);
    };
  }, [hidden]);

  return (
    <div>
      {stats ? (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {stats.map((item, key) => {
            const date = new Date(item.timestamp);
            date.setMinutes(date.getMinutes() + 30);
            date.setMinutes(0);

            let total = 0;
            item.results.data.forEach((data) => {
              total += data.votes;
            });

            return (
              <li key={key} className="text-center">
                <h2 className="font-bold">{date.toDateString()}</h2>
                <h3 className="italic">{`${date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                  timeZone: "Asia/Kuala_Lumpur"
                })} Session - ${total} vote${total > 1 ? "s" : ""}`}</h3>
                <div className="flex justify-center">
                  <VoteChart
                    hidden={item.results.hidden}
                    dataset={item.results.data}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
