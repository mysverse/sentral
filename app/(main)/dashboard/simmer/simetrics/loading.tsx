function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />
      <div className="h-64 w-full animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr>
      <td className="py-4 pr-3 pl-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-4">
        <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
    </tr>
  );
}

export default function SimetricsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Filter bar skeleton */}
      <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonChart />

      {/* Table skeleton */}
      <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              {["Name", "Rank", "Sessions", "Avg. Duration", "Cumulative"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
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
