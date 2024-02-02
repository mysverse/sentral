"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

import { useEffect, useState } from "react";

import {
  InvoteSeats,
  InvoteStatsTimestamp,
  useInvoteSeatStats,
  useInvoteSeriesIdentifiers,
  useInvoteStats
} from "components/swr";

import ElectionMap from "components/electionMap";
import ElectionSeatMap from "components/electionSeatMap";
import Spinner from "components/spinner";
import DefaultTransitionLayout from "components/transition";
import dynamic from "next/dynamic";
import {
  calculateSeats,
  frequencySort,
  getSeatColours,
  getStatsObject
} from "./_utils/chartUtils";

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

const VoteShareChart = dynamic(() => import("./_components/VoteShareChart"));
const VoteSection = dynamic(() => import("./_components/VoteSection"));
const SeatsPieChart = dynamic(() => import("./_components/SeatsPieChart"));

function Stats1({ stats }: { stats: InvoteStatsTimestamp[] }) {
  if (!stats) return null;

  const statsObject = getStatsObject(stats);

  const newStats2 = Object.keys(statsObject).map((key) => ({
    name: key,
    stat: statsObject[key]
  }));

  return (
    <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
      {newStats2.map((item) => (
        <div
          key={item.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-gray-500">
            {item.name === "ROSAK" ? "Invalid" : item.name}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {item.stat}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Stats3({ stats }: { stats: InvoteStatsTimestamp[] }) {
  if (!stats) return null;

  const statsObject = getStatsObject(stats);
  const seats = calculateSeats(statsObject);

  const newStats2 = Object.keys(seats).map((key) => ({
    name: key,
    stat: seats[key]
  }));

  return (
    <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-2">
      {newStats2.map((item) => (
        <div
          key={item.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-gray-500">
            {item.name === "ROSAK" ? "Invalid" : item.name}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {item.stat}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SeatsGeoMap({
  stats,
  seatStats
}: {
  stats: InvoteStatsTimestamp[];
  seatStats: InvoteSeats[];
}) {
  const colours = getSeatColours(stats, seatStats);

  if (!colours) return null;

  return <ElectionMap colours={colours} />;
}

function SeatsParliamentMap({
  stats,
  seatStats
}: {
  stats: InvoteStatsTimestamp[];
  seatStats: InvoteSeats[];
}) {
  const colours = getSeatColours(stats, seatStats);

  if (!colours) return null;

  return <ElectionSeatMap colours={frequencySort(colours)} />;
}

export default function InvotePage() {
  const { stats: seriesIdentifiers } = useInvoteSeriesIdentifiers(true);

  const [series, setSeries] = useState<string>();

  const {
    stats: stats
    // isLoading: loading,
    // isError: error
  } = useInvoteStats(typeof series !== "undefined", series);

  const {
    stats: seatStats
    // isLoading: seatLoading,
    // isError: seatError
  } = useInvoteSeatStats(typeof series !== "undefined", series);

  useEffect(() => {
    if (!series && seriesIdentifiers) {
      const defaultSeries = seriesIdentifiers[0];
      if (defaultSeries) {
        setSeries(defaultSeries);
      }
    }
  }, [series, seriesIdentifiers]);

  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Election series selection
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a series to view the results
              </p>
            </div>
            <div className="sm:flex sm:w-full sm:max-w-full">
              <div className="flex min-w-0 flex-1 rounded-md shadow-sm">
                <select
                  id="series_identifier"
                  name="series_identifier"
                  className="mt-3 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                  onChange={(e) => {
                    const index = parseInt(e.target.value);
                    if (seriesIdentifiers) {
                      const selectedSeries = seriesIdentifiers[index];
                      if (selectedSeries) {
                        setSeries(selectedSeries);
                      }
                    }
                  }}
                  defaultValue={!seriesIdentifiers ? "hidden" : 0}
                  disabled={!seriesIdentifiers}
                >
                  {seriesIdentifiers ? (
                    seriesIdentifiers.map((name, index) => (
                      <option key={index} value={index}>
                        {name}
                      </option>
                    ))
                  ) : (
                    <option hidden disabled value="hidden">
                      Loading...
                    </option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats && seatStats ? (
        <DefaultTransitionLayout show={true} appear={true}>
          <h3 className="mb-4 mt-6 text-center text-lg font-medium text-gray-900">
            Votes by Party
          </h3>

          {stats ? (
            stats.some((item) => item.results.hidden) ? (
              <h3 className="mb-4 mt-6 text-center italic text-gray-900">
                {
                  "This series is currently ongoing, it may take up to 3 hours for accurate results to show up."
                }
              </h3>
            ) : null
          ) : null}

          <div className="sm:px-6- rounded-lg bg-white px-5 py-8 shadow">
            <VoteShareChart stats={stats} />
          </div>

          <div className="sm:px-6- mb-8 mt-6">
            <Stats1 stats={stats} />
          </div>

          <h3 className="mb-6 mt-8 text-center text-lg font-medium leading-6 text-gray-900">
            Votes by Polling Session
          </h3>
          <div className="sm:px-6- rounded-lg bg-white px-5 py-8 shadow">
            <VoteSection stats={stats} />
          </div>
          <h3 className="mb-6 mt-8 text-center text-lg font-medium leading-6 text-gray-900">
            Parliament Seats Distribution
          </h3>
          <div className="mb-8">
            <Stats3 stats={stats} />
          </div>
          <div className="sm:px-6- mb-8 rounded-lg bg-white px-5 py-8 shadow">
            <div className="flex justify-center">
              <SeatsGeoMap stats={stats} seatStats={seatStats} />
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-white px-5 py-8 shadow">
              <div className="flex h-48 w-full justify-center">
                <SeatsParliamentMap stats={stats} seatStats={seatStats} />
              </div>
            </div>
            <div className="rounded-lg bg-white px-5 py-8 shadow">
              <SeatsPieChart stats={stats} />
            </div>
          </dl>
        </DefaultTransitionLayout>
      ) : (
        <div className="sm:px-6- h-screen px-5 py-32">
          <Spinner />
        </div>
      )}
    </div>
  );
}
