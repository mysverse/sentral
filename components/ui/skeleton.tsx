import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("bg-edge animate-pulse rounded", className)} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-surface rounded-lg px-4 py-5 shadow-sm sm:px-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={clsx("h-4", i % 2 ? "w-2/3" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-surface relative overflow-hidden rounded-lg px-4 pt-5 pb-12 shadow-sm sm:px-6 sm:pt-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
      <div className="bg-surface-muted absolute inset-x-0 bottom-0 px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function SkeletonStatGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChartCard() {
  return (
    <div className="bg-surface rounded-lg p-6 shadow-sm">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="bg-surface-muted h-64 w-full rounded" />
    </div>
  );
}

export function SkeletonTableCard({
  rows = 5,
  cols = 4
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <table className="divide-edge min-w-full divide-y">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-3.5">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-edge divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-3 py-4">
                  <Skeleton
                    className={clsx("h-4", c === 0 ? "w-24" : "w-16")}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
