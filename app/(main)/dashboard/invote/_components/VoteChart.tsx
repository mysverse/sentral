import React, { useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  getColourByName,
  getProgressiveGrayColour
} from "../_utils/chartUtils";
import { VoteData } from "../_schema/types";
import { useInView } from "motion/react";

export default function VoteChart({
  hidden,
  dataset
}: {
  hidden: boolean;
  dataset: VoteData[];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div className="relative h-64 w-full" ref={ref}>
      <Doughnut
        data={{
          labels: hidden ? [] : dataset.map((data) => data.name),
          datasets: [
            {
              label: "Ballots",
              data: isInView ? dataset.map((data) => data.votes) : [],
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
