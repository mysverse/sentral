"use client";

import { Avatar } from "components/catalyst/avatar";
import { Leaderboard } from "components/constants/types";
import DefaultTransitionLayout from "components/transition";
import Link from "next/link";
import DateUtils from "../_utils/DateUtils";
import clsx from "clsx";

const excludeUserIds = [
  1285847356, 1876595055, 6071081546, 3609860927, 7546483278
];

export default function LebuhrayaLeaderboard({
  type,
  data,
  limit,
  order
}: {
  type?: string;
  data: Leaderboard[];
  limit?: number;
  order?: number;
}) {
  limit = limit ?? 100;
  data = data
    .filter((v) => !excludeUserIds.includes(v.user.id))
    .slice(0, limit);
  const currentWeekInfo = DateUtils.getCurrentWeekInfo();
  return (
    <DefaultTransitionLayout show={!!data} appear={true}>
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div
          className={clsx(
            "flex h-20 flex-col items-center text-center align-middle text-lg font-bold",
            order === 1 && "text-white",
            order === 2 && "text-black lg:text-white",
            !order && "text-black"
          )}
        >
          {type === "school" ? (
            <div className="my-auto">
              <h2 className="text-sm font-normal tracking-widest uppercase">
                SMK MYS II
              </h2>
              <h1>Top {limit.toLocaleString()} Lebuhraya Quiz Students</h1>
            </div>
          ) : type === "food" ? (
            <div className="my-auto">
              <h2 className="text-sm font-normal tracking-widest uppercase">
                Masjid Kampung Merbang
              </h2>
              <h1>Top {limit.toLocaleString()} Lebuhraya Buffet Score</h1>
            </div>
          ) : type === "weekly" ? (
            <div className="my-auto">
              <h2 className="text-sm font-normal tracking-widest uppercase">
                {currentWeekInfo.startDate.toDateString()}
                {" > "}
                {currentWeekInfo.endDate.toDateString()}
              </h2>
              <h1>
                Top {limit.toLocaleString()} Lebuhraya Lap Times for Week{" "}
                {currentWeekInfo.weekNumber}
              </h1>
            </div>
          ) : (
            <div className="my-auto">
              <h2 className="text-sm font-normal tracking-widest uppercase">
                All-Time
              </h2>
              <h1>Top {limit.toLocaleString()} Lebuhraya Lap Times</h1>
            </div>
          )}
        </div>
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow-sm ring-1 ring-black/5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    <span className="hidden sm:block">Position</span>
                    <span className="block sm:hidden">No.</span>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Player
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {type === "school"
                      ? "Quiz Score"
                      : type === "food"
                        ? "Food Score"
                        : "Record Time"}
                  </th>
                  {/* <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Role
                  </th> */}
                  {/* <th
                    scope="col"
                    className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                  >
                    <span className="sr-only">Edit</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data
                  .filter((person) => person.user)
                  .map((person, index) => (
                    <tr key={person.user.id}>
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                        {`${(index + 1).toString().padStart(3, "0")}`}
                      </td>
                      {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {person.email}
                    </td> */}
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        <Link
                          href={`https://roblox.com/users/${person.user.id}/profile`}
                          target="=_blank"
                          className="flex items-center"
                        >
                          <Avatar
                            className="size-8 sm:size-11"
                            src={person.image}
                            initials={person.user.displayName.slice(0, 1)}
                            square
                          />
                          <div className="ml-4 flex flex-col">
                            <div className="hidden font-semibold text-gray-900 hover:underline sm:block">
                              {`${person.user.displayName}`}
                            </div>
                            <div className="hidden text-xs text-gray-900/70 hover:underline sm:block">
                              {`@${person.user.name}`}
                            </div>
                            <div className="block font-medium text-gray-900 hover:underline sm:hidden">
                              {`@${person.user.name}`}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        {(person.time ?? person.score)?.toLocaleString()}
                      </td>
                      {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit<span className="sr-only">, {person.name}</span>
                      </a>
                    </td> */}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultTransitionLayout>
  );
}
