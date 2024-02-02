import { Pie } from "react-chartjs-2";
import { VoteData } from "../_schema/types";
import {
  getProgressiveGrayColour,
  getColourByName
} from "../_utils/chartUtils";

export default function SeatChart({
  hidden,
  dataset
}: {
  hidden: boolean;
  dataset: VoteData[];
}) {
  return (
    <div className="relative h-48 w-full">
      <Pie
        data={{
          labels: hidden ? [] : dataset.map((data) => data.name),
          datasets: [
            {
              label: "Seats",
              data: dataset.map((data) => data.votes),
              backgroundColor: dataset.map((value, index) => {
                if (hidden) {
                  return getProgressiveGrayColour(index, dataset.length);
                } else {
                  return value.colour ?? getColourByName(value.name);
                }
              })
            }
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false
        }}
      />
    </div>
  );
}
