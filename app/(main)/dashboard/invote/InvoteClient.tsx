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
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useQueryState } from "nuqs";
import useWebSocket from "react-use-websocket";
import dynamic from "next/dynamic";
import CountUp from "react-countup";

import {
  InvoteSeats,
  InvoteStatsTimestamp,
  useInvoteSeatStats,
  useInvoteStats
} from "components/swr";
import {
  calculateSeats,
  frequencySort,
  getSeatColours,
  getSeatParties,
  getStatsObject
} from "./_utils/chartUtils";
import { endpoints } from "components/constants/endpoints";
import { addPathToUrl, replaceHttpWithWs } from "utils/ws";
import { regionNames } from "data/invote";
import { NotifyButton } from "components/NotifyButton";
import { notify } from "utils/notification";
import { getCodeFromIndex } from "utils/invote";
import ElectionMap from "components/electionMap";
import ElectionSeatMap from "components/electionSeatMap";
import Spinner from "components/spinner";
import DefaultTransitionLayout from "components/transition";
import useNotificationSound from "hooks/playNotificationSound";

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

  const newStats2 = Object.keys(statsObject)
    .map((key) => ({
      name: key,
      stat: statsObject[key]
    }))
    .sort((a, b) => b.stat - a.stat);

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
            <CountUp
              end={item.stat}
              enableScrollSpy={true}
              scrollSpyOnce={true}
            />
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

  const newStats2 = Object.keys(seats)
    .map((key) => ({
      name: key,
      stat: seats[key]
    }))
    .sort((a, b) => b.stat - a.stat);

  return (
    <dl className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">
      {newStats2.map((item) => (
        <div
          key={item.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-gray-500">
            {item.name === "ROSAK" ? "Invalid" : item.name}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <CountUp
              end={item.stat}
              enableScrollSpy={true}
              scrollSpyOnce={true}
            />
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
  const parties = getSeatParties(stats, seatStats);

  if (!(colours && parties)) return null;

  return <ElectionMap colours={colours} parties={parties} />;
}

function SeatsParliamentMap({
  stats,
  seatStats
}: {
  stats: InvoteStatsTimestamp[];
  seatStats: InvoteSeats[];
}) {
  const colours = getSeatColours(stats, seatStats, true);

  if (!colours) return null;

  return <ElectionSeatMap colours={frequencySort(colours)} />;
}

interface InvoteWSMessage {
  t: string;
  s: string;
  d?: {
    type: "seat";
    index: number;
    party: string;
  };
}

export default function InvotePage({
  seriesIdentifiers
}: {
  seriesIdentifiers: string[];
}) {
  const [series, setSeries] = useQueryState<string>("series", {
    defaultValue: seriesIdentifiers[0],
    parse: (value) => value,
    shallow: false
  });

  const { stats: stats } = useInvoteStats(
    typeof series !== "undefined",
    series
  );

  const { stats: seatStats, url } = useInvoteSeatStats(
    typeof series !== "undefined",
    series
  );

  const wsEndpoint = addPathToUrl(replaceHttpWithWs(endpoints.invote!), "ws");

  const { lastMessage } = useWebSocket(wsEndpoint, {
    shouldReconnect: () => true
  });

  const playSound = useNotificationSound();

  const lastProcessedMessage = useRef<MessageEvent | null>(null);

  const handleUpdate = useCallback(
    (lastMessage: MessageEvent) => {
      const msg: InvoteWSMessage = JSON.parse(lastMessage.data);
      if (msg.s === series && msg.d && msg.d.type === "seat") {
        const code = getCodeFromIndex(msg.d.index);
        const title = `${msg.d.party} wins ${code}`;
        const description = `The constituency ${code} - ${regionNames[code]} has been assigned to the party ${msg.d.party}`;
        if (Notification.permission === "granted") {
          notify(title, { body: description, icon: "/icon.png" });
        } else {
          playSound();
          toast.info(title, {
            closeButton: true,
            duration: Infinity,
            description
          });
        }
        mutate(url);
      }
    },
    [series, url, playSound]
  );

  useEffect(() => {
    if (lastMessage && lastMessage !== lastProcessedMessage.current) {
      handleUpdate(lastMessage);
      lastProcessedMessage.current = lastMessage;
    }
  }, [lastMessage, handleUpdate]);

  return (
    <>
      <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Election series selection
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a series to view the results
                </p>
              </div>
              <div>
                <NotifyButton />
              </div>
            </div>
            <div className="sm:flex sm:w-full sm:max-w-full">
              <div className="flex min-w-0 flex-1 rounded-md shadow-sm">
                <select
                  id="series_identifier"
                  name="series_identifier"
                  className="mt-3 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-slate-500 focus:outline-none focus:ring-slate-500 sm:text-sm"
                  onChange={(e) => {
                    setSeries(e.target.value);
                  }}
                  value={series}
                >
                  {seriesIdentifiers.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats && seatStats ? (
        <>
          <DefaultTransitionLayout show={stats.length > 0} appear={true}>
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
              ) : stats.length === 0 ? (
                <h3 className="mb-4 mt-6 text-center italic text-gray-900">
                  {"No data available for this series."}
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
          </DefaultTransitionLayout>
          <DefaultTransitionLayout show={seatStats.length > 0} appear={true}>
            <h3 className="mb-6 mt-8 text-center text-lg font-medium leading-6 text-gray-900">
              Parliament Seats Distribution
            </h3>
            <div className="mb-8">
              <Stats3 stats={stats} />
            </div>
            <div className="sm:px-6- mb-8 rounded-lg bg-white px-5 py-8 shadow">
              <div className="relative flex flex-col justify-center gap-6">
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
        </>
      ) : (
        <div className="sm:px-6- h-screen px-5 py-32">
          <Spinner />
        </div>
      )}
    </>
  );
}
