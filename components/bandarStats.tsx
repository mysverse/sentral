"use client";

import humanizeDuration from "humanize-duration";
import Spinner from "./spinner";
import { MYSverseData, useMysverseData } from "./swr";
import clsx from "clsx";

function Stats({ bandarData }: { bandarData: MYSverseData["bandarData"] }) {
  const stats = [
    {
      name: "Playtime",
      value: humanizeDuration(bandarData.SessionTimeKeeper * 1000, {
        units: ["h", "m", "s", "ms"],
        largest: 1,
        round: true
      })
      // change: "+4.75%",
      // changeType: "positive"
    },
    {
      name: "Currency",
      value: bandarData.bandar_ringgit.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      // change: "+54.02%",
      // changeType: "negative"
    },
    {
      name: "Cars owned",
      value: bandarData.MYS_PermanentVehicles_2.length
      // change: "-1.39%",
      // changeType: "positive"
    }
    // {
    //   name: "Expenses",
    //   value: "$30,156.00",
    //   change: "+10.18%",
    //   changeType: "negative"
    // }
  ];
  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
        >
          <dt className="text-sm font-medium leading-6 text-gray-500">
            {stat.name}
          </dt>
          {/* <dd
            className={clsx(
              stat.changeType === "negative"
                ? "text-rose-600"
                : "text-gray-700",
              "text-xs font-medium"
            )}
          >
            {stat.change}
          </dd> */}
          <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function BandarStats({
  bandarData
}: {
  bandarData: MYSverseData["bandarData"];
}) {
  return (
    <>
      <Stats bandarData={bandarData} />
    </>
  );
}

function Arrests({ arrests }: { arrests: MYSverseData["arrests"] }) {
  const statuses = {
    Served: "text-green-700 bg-green-50 ring-green-600/20",
    Ongoing: "text-gray-600 bg-gray-50 ring-gray-500/10",
    Issue: "text-red-700 bg-red-50 ring-red-600/10"
  };

  return arrests.length > 0 ? (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-8"
    >
      {arrests.map((arrest) => {
        const timeArrest = new Date(arrest.Time_Arrest);
        const timeRelease = new Date(arrest.Time_Release);
        const [x, y, z] = arrest.Location_Arrest;
        return (
          <li
            key={arrest.Reference}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 px-6 py-4">
              {/* <img
              src={client.imageUrl}
              alt={client.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            /> */}
              <div className="text-sm font-medium leading-6 text-gray-900">
                {arrest.Reference}
              </div>
              <div
                className={clsx(
                  statuses[arrest.Time_Release ? "Served" : "Ongoing"],
                  "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                )}
              >
                {arrest.Time_Release ? "Served" : "Ongoing"}
              </div>
            </div>

            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Time arrested</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeArrest.toLocaleString()}>
                    {timeArrest.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Time released</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeRelease.toLocaleString()}>
                    {timeRelease.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Officer ID</dt>
                <dd className="text-gray-700">{arrest.Player_Arresting}</dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Location</dt>
                <dd className="text-gray-700">
                  {arrest.StringLocation || `${x}°X, ${z}°Z`}
                </dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 pt-3">
                <dt className="text-gray-500">Reason</dt>
              </div>
            </dl>
            <div className="px-6 pb-6 text-sm text-gray-600">
              {arrest.Description || "N/A"}
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="italic opacity-80">
      No records to show. Congratulations for being a law-abiding citizen!
    </div>
  );
}

function Summons({ summons }: { summons: MYSverseData["summons"] }) {
  const statuses = {
    Paid: "text-green-700 bg-green-50 ring-green-600/20",
    Dispute: "text-red-700 bg-red-50 ring-red-600/10"
  };

  return summons.length > 0 ? (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:gap-x-8"
    >
      {summons.map((summon) => {
        const timeOffence = new Date(summon.OffenceTime);
        return (
          <li
            key={summon.Reference}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 px-6 py-4">
              {/* <img
              src={client.imageUrl}
              alt={client.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            /> */}
              <div className="text-sm font-medium leading-6 text-gray-900">
                {summon.Reference}
              </div>
              <div
                className={clsx(
                  statuses[summon.Dispute ? "Dispute" : "Paid"],
                  "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                )}
              >
                {summon.Dispute ? "Dispute" : "Paid"}
              </div>
            </div>

            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Time</dt>
                <dd className="text-gray-700">
                  <time dateTime={timeOffence.toLocaleString()}>
                    {timeOffence.toLocaleString()}
                  </time>
                </dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Amount</dt>
                <dd className="text-gray-700">
                  {`${summon.FineAmount.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Officer ID</dt>
                <dd className="text-gray-700">{summon.Officer}</dd>
              </div>
              <div className="flex flex-col lg:flex-row justify-between gap-x-4 pt-3">
                <dt className="text-gray-500">Description</dt>
              </div>
            </dl>
            <div className="px-6 pb-6 text-sm text-gray-600">
              {summon.OffenceDescription || "N/A"}
            </div>
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="italic opacity-80">
      No records to show. Congratulations for being a law-abiding citizen!
    </div>
  );
}

export default function MysverseStats({ userId }: { userId: string }) {
  const { apiResponse: data } = useMysverseData(true, userId);
  return (
    <div>
      {data ? (
        <>
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <header>
              <h3 className="text-xl font-bold">Bandar Insights</h3>
            </header>
            <BandarStats bandarData={data.bandarData} />
          </div>
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-8">
            <header className="mb-6">
              <h3 className="text-xl font-bold mb-2">Arrests</h3>
              <ul className="flex flex-col list-disc ml-4 gap-y-1">
                <li className="opacity-80">{`Arrests are made by (roleplay) law enforcement officers for breaking major in-game laws.`}</li>
                <li className="opacity-80">{`Players will be held inside a lock-up for a fixed time period, after which they are released and gameplay resumes.`}</li>
              </ul>
            </header>
            <Arrests arrests={data.arrests} />
          </div>

          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-8">
            <header className="mb-6">
              <h3 className="text-xl font-bold mb-2">Summonses</h3>
              <ul className="flex flex-col list-disc ml-4 gap-y-1">
                <li className="opacity-80">{`A summons is issued by a (roleplay) law enforcement officer for breaking minor in-game laws.`}</li>
                <li className="opacity-80">{`The fine amount is typically deducted directly from the player's in-game bank account.`}</li>
              </ul>
            </header>
            <Summons summons={data.summons} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 flex justify-center items-center h-[50vh]">
          <Spinner />
        </div>
      )}
    </div>
  );
}
