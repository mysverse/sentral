"use client";

import { useState } from "react";
import { User } from "./page";

export default function SimetryTable({ dataset }: { dataset: User[] }) {
  const [sortKey, setSortKey] = useState<
    keyof User | "dutyDuration" | "cumulativeDutyDuration"
  >("dutyDuration");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filtered = [...dataset].filter((obj) => !obj.location.includes("Test"));

  const averageDutyDuration = (userId: number, data: User[]): number => {
    const userData = data.filter((obj) => obj.name.userId === userId);
    const totalDuration = userData.reduce(
      (total, entry) => total + entry.dutyDuration,
      0
    );
    return totalDuration / userData.length;
  };

  const avg = new Map<number, number>();

  filtered.forEach((obj) => {
    avg.set(obj.name.userId, averageDutyDuration(obj.name.userId, filtered));
  });

  const sortedData = [...filtered]
    .sort((a, b) => {
      const keyA =
        sortKey === "dutyDuration"
          ? avg.get(a.name.userId)!
          : a.cumulativeDutyDuration;
      const keyB =
        sortKey === "dutyDuration"
          ? avg.get(b.name.userId)!
          : b.cumulativeDutyDuration;

      if (sortOrder === "asc") {
        return keyA - keyB;
      } else {
        return keyB - keyA;
      }
    })
    .filter(
      (obj1, i, arr) =>
        arr.findIndex((obj2) => obj2.name.userId === obj1.name.userId) === i
    );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-white">
            Duty Duration Metrics
          </h1>
          <p className="mt-2 text-sm text-white">
            A list of all Polis MYSverse users and their duty duration metrics.
          </p>
        </div>
        {/* <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add user
          </button>
        </div> */}
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-white">Sort By</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          value={sortKey}
          onChange={(e) =>
            setSortKey(
              e.target.value as
                | keyof User
                | "dutyDuration"
                | "cumulativeDutyDuration"
            )
          }
        >
          <option value="dutyDuration">Duty Duration</option>
          <option value="cumulativeDutyDuration">
            Cumulative Duty Duration
          </option>
        </select>
        <button
          className="mt-2 rounded-md bg-gray-200 px-3 py-1 text-sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
        </button>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Avg. Duty Duration (seconds)
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Cumulative Duty Duration (seconds)
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Location
                  </th>
                  {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedData.map((user) => (
                  <tr key={user.name.userId} className="even:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">
                      {user.name.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.rank}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {avg.get(user.name.userId)?.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.cumulativeDutyDuration.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.location}
                    </td>
                    {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit<span className="sr-only">, {user.name.name}</span>
                      </a>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
