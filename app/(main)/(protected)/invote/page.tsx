"use client";

import { NextPage } from "next";
import Head from "next/head";
import Footer from "components/footer";

import Navigation from "components/nav";
import { Pie, Doughnut, Bar } from "react-chartjs-2";

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

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

interface VoteData {
  name: string;
  votes: number;
  colour?: string;
}

const sampleData: VoteData[] = [
  {
    name: "B",
    votes: 80,
    colour: "blue"
  },
  {
    name: "A",
    votes: 100,
    colour: "red"
  },
  {
    name: "C",
    votes: 50,
    colour: "yellow"
  },
  {
    name: "D",
    votes: 30,
    colour: "green"
  }
].sort((a, b) => b.votes - a.votes);

function getColourByName(name: string | null) {
  switch (name) {
    case "PDM":
      return "#12447E";
    case "PTA":
      return "#0000AD";
    case "BRM":
      return "#FF1414";
    case "PPR":
      return "#d4d42b";
    default:
      return "gray";
  }
}

function getProgressiveGrayColour(index: number, total: number) {
  return `rgba(0, 0, 0, ${((total - index) / total) * 0.4 + 0.2})`;
}

function frequencySort(arr: string[]) {
  const countOccurrences = (arr: string[], val: string) =>
    arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
  interface arrayCount {
    [key: string]: {
      num: number;
      i: number;
    };
  }
  let d: arrayCount = {};
  arr = JSON.parse(JSON.stringify(arr));
  arr.forEach(
    (i, index) =>
      (d[i] = {
        num: countOccurrences(arr, i),
        i: index
      })
  );
  arr.sort(function (a, b) {
    let diff = d[b].num - d[a].num;
    if (diff == 0) diff = d[b].i - d[a].i;
    return diff;
  });

  return arr;
}

function getSeatHolders(seatData?: InvoteSeats[]) {
  if (seatData) {
    return seatData.map((seat) => seat.party);
  }
  return [];
}

function VoteChart({
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

function SeatChart({
  hidden,
  dataset
}: {
  hidden: boolean;
  dataset: VoteData[];
}) {
  return (
    <div className="relative w-full h-48">
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

function VoteShareChart({ stats }: { stats: InvoteStatsTimestamp[] }) {
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

interface StatNumber {
  [key: string]: number;
}

function calculateSeats(stats: StatNumber) {
  const ignoreKeys = ["ROSAK"];
  const seats = 30;

  // Without ROSAK
  const filtered = Object.keys(stats)
    .filter((key) => !ignoreKeys.includes(key))
    .reduce((obj: StatNumber, key) => {
      obj[key] = stats[key];
      return obj;
    }, {});

  const totalValidVotes = Object.values(filtered).reduce((a, b) => a + b, 0);

  // Parties with above 10% of the vote
  const filtered2 = Object.keys(filtered)
    .filter((key) => filtered[key] / totalValidVotes > 0.1)
    .reduce((obj: StatNumber, key) => {
      obj[key] = filtered[key];
      return obj;
    }, {});

  const totalValidPartyVotes = Object.values(filtered2).reduce(
    (a, b) => a + b,
    0
  );

  return Object.keys(filtered2).reduce((obj: StatNumber, key) => {
    const votes = filtered2[key];
    obj[key] = Math.floor((votes / totalValidPartyVotes) * seats + 0.5);
    // obj[key] = filtered2[key];
    return obj;
  }, {});
}

function getStatsObject(stats: InvoteStatsTimestamp[]) {
  const newData: StatNumber = {};
  for (const item of stats) {
    const data = item.results.data;
    for (const party of data) {
      if (newData[party.name]) {
        newData[party.name] += party.votes;
      } else {
        newData[party.name] = party.votes;
      }
    }
  }
  return newData;
}

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

function Stats2({ stats }: { stats: InvoteStatsTimestamp[] }) {
  if (!stats) return null;

  interface stat {
    name: string;
    stat: string;
  }

  const statsObject = getStatsObject(stats);

  const total = Object.values(statsObject).reduce((a, b) => a + b, 0);

  const ignoreKeys = ["ROSAK"];

  const filtered = Object.keys(statsObject)
    .filter((key) => !ignoreKeys.includes(key))
    .reduce((obj: StatNumber, key) => {
      obj[key] = statsObject[key];
      return obj;
    }, {});

  const valid = Object.values(filtered).reduce((a, b) => a + b, 0);
  const invalid = total - valid;

  const newStats: stat[] = [
    {
      name: "Total Votes",
      stat: total.toString()
    },
    { name: "Valid Votes", stat: valid.toString() },
    { name: "Invalid Votes", stat: invalid.toString() }
  ];

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 text-center">
        Votes Validity
      </h3>
      <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {newStats.map((item) => (
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
    </div>
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

function SeatsPieChart({ stats }: { stats: InvoteStatsTimestamp[] }) {
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

function VoteSection({ stats }: { stats: InvoteStatsTimestamp[] }) {
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
      ) : (
        <Pie
          data={{
            labels: hidden ? [] : sampleData.map((data) => data.name),
            datasets: [
              {
                label: "Ballots",
                data: sampleData.map((data) => data.votes),
                backgroundColor: sampleData.map((value, index) => {
                  if (hidden) {
                    return getProgressiveGrayColour(index, sampleData.length);
                  } else {
                    return value.colour;
                  }
                })
              }
            ]
          }}
        />
      )}
    </div>
  );
}

function getSeatColours(
  stats: InvoteStatsTimestamp[],
  seatStats: InvoteSeats[]
) {
  if (!stats && !seatStats) return null;

  const statsObject = getStatsObject(stats);

  const seatHolders = getSeatHolders(seatStats);

  const seatColours = seatHolders.map((item) => getColourByName(item));

  // if hidden

  const hidden = stats.some((item) => item.results.hidden);

  const projectedSeats = calculateSeats(statsObject);

  const projectedSeatHolders = [];

  for (const key in projectedSeats) {
    const value = projectedSeats[key];
    for (let i = 0; i < value; i++) {
      projectedSeatHolders.push(key);
    }
  }

  const statsCount = Object.keys(projectedSeats).map((key) => ({
    name: key,
    stat: statsObject[key]
  }));

  const partyColours = statsCount.map((item, index) => ({
    colour: getProgressiveGrayColour(index, statsCount.length),
    ...item
  }));

  const hiddenSeatColours = projectedSeatHolders.map(
    (item) =>
      partyColours.find((party) => party.name === item)?.colour || "silver"
  );

  if (hidden) {
    return hiddenSeatColours;
  }

  return seatColours;
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

function Main() {
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
    <>
      <Head>
        <title>inVote</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="inVote" />
        <meta property="og:site_name" content="MYX Labs" />
        <meta property="og:url" content="https://myx.yan.gg/invote" />
        <meta
          property="og:description"
          content="Voting statistics for community elections. A MYX Labs donationware project."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://myx.yan.gg/img/invote/og_image.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="inVote by MYX Labs" />
        <meta
          name="twitter:description"
          content="Voting statistics for community elections. A MYX Labs donationware project."
        />
        <meta
          name="twitter:image"
          content="https://myx.yan.gg/img/invote/og_image.png"
        />
      </Head>

      <main>
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="-mt-32 flex">
            <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                  <div>
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Election series selection
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a series to view the results
                      </p>
                    </div>
                    <div className="sm:max-w-full sm:w-full sm:flex">
                      <div className="min-w-0 flex flex-1 rounded-md shadow-sm">
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
                <>
                  <h3 className="text-lg font-medium text-gray-900 text-center mt-6 mb-4">
                    Votes by Party
                  </h3>

                  {stats ? (
                    stats.some((item) => item.results.hidden) ? (
                      <h3 className="italic text-gray-900 text-center mt-6 mb-4">
                        {
                          "This series is currently ongoing, it may take up to 3 hours for accurate results to show up."
                        }
                      </h3>
                    ) : null
                  ) : null}

                  <div className="bg-white rounded-lg shadow px-5 py-8 sm:px-6-">
                    <VoteShareChart stats={stats} />
                  </div>

                  <div className="mt-6 mb-8 sm:px-6-">
                    <Stats1 stats={stats} />
                  </div>

                  <h3 className="mt-8 mb-6 text-lg font-medium leading-6 text-gray-900 text-center">
                    Votes by Polling Session
                  </h3>
                  <div className="bg-white rounded-lg shadow px-5 py-8 sm:px-6-">
                    <VoteSection stats={stats} />
                  </div>
                  <h3 className="mt-8 mb-6 text-lg font-medium leading-6 text-gray-900 text-center">
                    Parliament Seats Distribution
                  </h3>
                  <div className="mb-8">
                    <Stats3 stats={stats} />
                  </div>
                  <div className="bg-white rounded-lg shadow px-5 py-8 mb-8 sm:px-6-">
                    <div className="flex justify-center">
                      <SeatsGeoMap stats={stats} seatStats={seatStats} />
                    </div>
                  </div>
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="bg-white rounded-lg shadow px-5 py-8">
                      <div className="flex justify-center h-48 w-full">
                        <SeatsParliamentMap
                          stats={stats}
                          seatStats={seatStats}
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow px-5 py-8">
                      <SeatsPieChart stats={stats} />
                    </div>
                  </dl>
                </>
              ) : (
                <div className="px-5 py-32 h-screen sm:px-6-">
                  <Spinner />
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}

export default Main;
