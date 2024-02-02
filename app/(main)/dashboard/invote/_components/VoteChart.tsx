import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  getColourByName,
  getProgressiveGrayColour
} from "../_utils/chartUtils";
import { VoteData } from "../_schema/types";

export default function VoteChart({
  hidden,
  dataset
}: {
  hidden: boolean;
  dataset: VoteData[];
}) {
  return (
    <div className="relative h-64 w-full">
      <Doughnut
        data={{
          labels: hidden ? [] : dataset.map((data) => data.name),
          datasets: [
            {
              label: "Ballots",
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
