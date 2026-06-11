import {
  Skeleton,
  SkeletonChartCard,
  SkeletonStatGrid
} from "components/ui/skeleton";

function SkeletonTableRow() {
  return (
    <tr>
      <td className="py-4 pr-3 pl-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-3 py-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="px-3 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-3 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
    </tr>
  );
}

export default function SimetricsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Filter bar skeleton */}
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <SkeletonStatGrid count={6} />

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChartCard />
        <SkeletonChartCard />
      </div>
      <SkeletonChartCard />

      {/* Table skeleton */}
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <table className="divide-edge min-w-full divide-y">
          <thead>
            <tr>
              {["Name", "Rank", "Sessions", "Avg. Duration", "Cumulative"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-strong px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
