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
      return (
        <ChevronDownIcon className="ml-1 inline h-4 w-4 text-gray-300 dark:text-gray-600" />
      );
    }
    return sortOrder === "desc" ? (
      <ChevronDownIcon className="text-primary-600 ml-1 inline h-4 w-4" />
    ) : (
      <ChevronUpIcon className="text-primary-600 ml-1 inline h-4 w-4" />
    );
  };

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-strong text-base leading-6 font-semibold">
            Duty Duration Metrics
          </h2>
          <p className="text-muted mt-1 text-sm">
            Individual user duty duration breakdown.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <div className="relative">
            <MagnifyingGlassIcon className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border-edge bg-surface text-strong placeholder:text-muted w-full rounded-md py-2 pr-3 pl-9 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="divide-edge min-w-full divide-y">
          <thead>
            <tr>
              <th className="text-strong py-3.5 pr-3 pl-4 text-left text-sm font-semibold">
                Name
              </th>
              <th className="text-strong px-3 py-3.5 text-left text-sm font-semibold">
                Rank
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-strong hover:text-primary-600 cursor-pointer px-3 py-3.5 text-left text-sm font-semibold select-none"
                >
                  {col.label}
                  <SortIcon columnKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((user) => (
                <motion.tr
                  key={user.name.userId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="even:bg-surface-muted"
                >
                  <td className="text-strong py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap">
                    @{user.name.name}
                  </td>
                  <td className="text-muted px-3 py-4 text-sm whitespace-nowrap">
                    {user.rank || "—"}
                  </td>
                  <td className="text-muted px-3 py-4 text-sm whitespace-nowrap">
                    {totalSessionsMap.get(user.name.userId) ?? 0}
                  </td>
                  <td className="text-muted px-3 py-4 text-sm whitespace-nowrap">
                    {humanise(avgMap.get(user.name.userId) ?? 0)}
                  </td>
                  <td className="text-muted px-3 py-4 text-sm whitespace-nowrap">
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
        <p className="text-strong text-sm">
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
                ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                : "text-muted hover:bg-surface-muted"
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
                ? "bg-surface-muted text-muted cursor-not-allowed"
                : "border-edge bg-surface text-strong hover:bg-primary-600 border hover:text-white"
            )}
          >
            Previous
          </button>
          <span className="text-muted px-3 text-sm">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage === totalPages}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm transition",
              safePage === totalPages
                ? "bg-surface-muted text-muted cursor-not-allowed"
                : "border-edge bg-surface text-strong hover:bg-primary-600 border hover:text-white"
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
                ? "cursor-not-allowed text-gray-300 dark:text-gray-600"
                : "text-muted hover:bg-surface-muted"
            )}
          >
            Last
          </button>
        </div>
      </div>
    </>
  );
}
