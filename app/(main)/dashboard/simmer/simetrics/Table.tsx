"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { humanise } from "utils/humanise";

import type { User } from "./types";
import {
  computeUserAggregates,
  filterTestLocations,
  removeDuplicates
} from "./utils";

type SortKey = "totalSessions" | "dutyDuration" | "cumulativeDutyDuration";

export default function SimetryTable({ dataset }: { dataset: User[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("cumulativeDutyDuration");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const filtered = useMemo(() => filterTestLocations(dataset), [dataset]);

  const { avgMap, totalSessionsMap } = useMemo(
    () => computeUserAggregates(filtered),
    [filtered]
  );

  const sortedData = useMemo(() => {
    let data = removeDuplicates(filtered);

    if (search) {
      const query = search.toLowerCase();
      data = data.filter((u) => u.name.name.toLowerCase().includes(query));
    }

    return data.sort((a, b) => {
      const keyA =
        sortKey === "dutyDuration"
          ? (avgMap.get(a.name.userId) ?? 0)
          : sortKey === "totalSessions"
            ? (totalSessionsMap.get(a.name.userId) ?? 0)
            : a.cumulativeDutyDuration;

      const keyB =
        sortKey === "dutyDuration"
          ? (avgMap.get(b.name.userId) ?? 0)
          : sortKey === "totalSessions"
            ? (totalSessionsMap.get(b.name.userId) ?? 0)
            : b.cumulativeDutyDuration;

      return sortOrder === "asc" ? keyA - keyB : keyB - keyA;
    });
  }, [filtered, search, sortKey, sortOrder, avgMap, totalSessionsMap]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to page 1 when search changes
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedData = sortedData.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: "totalSessions", label: "Total Sessions" },
    { key: "dutyDuration", label: "Avg. Duration" },
    { key: "cumulativeDutyDuration", label: "Cumulative Duration" }
  ];

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ChevronDownIcon className="ml-1 inline h-4 w-4 text-gray-300" />;
    }
    return sortOrder === "desc" ? (
      <ChevronDownIcon className="ml-1 inline h-4 w-4 text-blue-600" />
    ) : (
      <ChevronUpIcon className="ml-1 inline h-4 w-4 text-blue-600" />
    );
  };

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base leading-6 font-semibold text-gray-900">
            Duty Duration Metrics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Individual user duty duration breakdown.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-md border-gray-300 py-2 pr-3 pl-9 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Rank
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 select-none hover:text-blue-600"
                >
                  {col.label}
                  <SortIcon columnKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((user) => (
                <motion.tr
                  key={user.name.userId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="even:bg-gray-50"
                >
                  <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    @{user.name.name}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {user.rank || "—"}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {totalSessionsMap.get(user.name.userId) ?? 0}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {humanise(avgMap.get(user.name.userId) ?? 0)}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                    {humanise(user.cumulativeDutyDuration)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-gray-700">
          {totalItems > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium">
                {(safePage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(safePage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </>
          ) : (
            "No results found"
          )}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safePage === 1}
            className={clsx(
              "rounded-md px-2.5 py-1.5 text-sm transition",
              safePage === 1
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            First
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage === 1}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm transition",
              safePage === 1
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
            )}
          >
            Previous
          </button>
          <span className="px-3 text-sm text-gray-600">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm transition",
              safePage === totalPages
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
            )}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safePage === totalPages}
            className={clsx(
              "rounded-md px-2.5 py-1.5 text-sm transition",
              safePage === totalPages
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Last
          </button>
        </div>
      </div>
    </>
  );
}
