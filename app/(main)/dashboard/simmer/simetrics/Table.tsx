"use client";

import { useState } from "react";
import humanizeDuration from "humanize-duration";
import { User } from "./page";

function humanise(seconds: number) {
  return humanizeDuration(seconds * 1000, {
    units: ["mo", "d", "h", "m", "s"],
    round: true,
    unitMeasures: {
      y: 31557600000,
      mo: 30 * 86400000,
      w: 604800000,
      d: 86400000,
      h: 3600000,
      m: 60000,
      s: 1000,
      ms: 1
    }
  });
}

function removeDuplicates(arr: User[]): User[] {
  const seen = new Set<number>();
  return arr.filter((obj) => {
    const keyValue = obj.name.userId;
    if (seen.has(keyValue)) {
      return false;
    } else {
      seen.add(keyValue);
      return true;
    }
  });
}

export default function SimetryTable({ dataset }: { dataset: User[] }) {
  const [sortKey, setSortKey] = useState<
    keyof User | "dutyDuration" | "cumulativeDutyDuration" | "totalSessions"
  >("cumulativeDutyDuration");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = dataset.filter((obj) => !obj.location.includes("Test"));

  const averageDutyDuration = (userId: number, data: User[]) => {
    const userData = data.filter((obj) => obj.name.userId === userId);
    const total = userData.length;
    const totalDuration = userData.reduce(
      (total, entry) => total + entry.dutyDuration,
      0
    );
    return {
      avg: totalDuration / total,
      total
    };
  };

  const avg = new Map<number, number>();
  const totalSessions = new Map<number, number>();

  filtered.forEach((obj) => {
    const { avg: average, total } = averageDutyDuration(
      obj.name.userId,
      filtered
    );
    avg.set(obj.name.userId, average);
    totalSessions.set(obj.name.userId, total);
  });

  const sortedData = removeDuplicates(filtered).sort((a, b) => {
    const keyA =
      sortKey === "dutyDuration"
        ? avg.get(a.name.userId)!
        : sortKey === "totalSessions"
          ? totalSessions.get(a.name.userId)!
          : a.cumulativeDutyDuration;

    const keyB =
      sortKey === "dutyDuration"
        ? avg.get(b.name.userId)!
        : sortKey === "totalSessions"
          ? totalSessions.get(b.name.userId)!
          : b.cumulativeDutyDuration;

    return sortOrder === "asc" ? keyA - keyB : keyB - keyA;
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base leading-6 font-semibold text-gray-900">
            Duty Duration Metrics
          </h1>
          <p className="mt-2 text-sm text-gray-900">
            A list of all Polis MYSverse users and their duty duration metrics.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="grow">
          <label className="block text-sm font-medium text-gray-900">
            Sort By
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
            value={sortKey}
            onChange={(e) =>
              setSortKey(
                e.target.value as
                  | keyof User
                  | "dutyDuration"
                  | "cumulativeDutyDuration"
                  | "totalSessions"
              )
            }
          >
            <option value="totalSessions">Total Duty Sessions</option>
            <option value="dutyDuration">Avg. Duty Duration</option>
            <option value="cumulativeDutyDuration">
              Cumulative Duty Duration
            </option>
          </select>
        </div>
        <button
          className="rounded-md bg-blue-600 px-8 py-3 text-sm text-white outline outline-blue-600 transition hover:bg-white hover:text-blue-600 sm:mt-6 sm:py-1"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
        </button>
      </div>
      <div className="mt-2">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Rank
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Total Duty Sessions
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Avg. Duty Duration
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Cumulative Duty Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedData.map((user) => (
                <tr key={user.name.userId} className="even:bg-gray-50">
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    @{user.name.name}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {user.rank}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {totalSessions.get(user.name.userId)}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {humanise(avg.get(user.name.userId)!)}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {humanise(user.cumulativeDutyDuration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`rounded-md px-3 py-1 transition ${
                currentPage === 1
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Previous
            </button>
            {(() => {
              const maxPageNumbersToShow = 3;
              const half = Math.floor(maxPageNumbersToShow / 2);
              let startPage = Math.max(1, currentPage - half);
              let endPage = Math.min(totalPages, currentPage + half);

              if (totalPages > maxPageNumbersToShow) {
                if (currentPage <= half) {
                  startPage = 1;
                  endPage = maxPageNumbersToShow;
                } else if (currentPage + half >= totalPages) {
                  startPage = totalPages - maxPageNumbersToShow + 1;
                  endPage = totalPages;
                } else {
                  startPage = currentPage - half;
                  endPage = currentPage + half;
                }
              } else {
                startPage = 1;
                endPage = totalPages;
              }

              const pageNumbers = [];
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
              }

              return pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md px-3 py-1 transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`rounded-md px-3 py-1 transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
