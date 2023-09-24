import Spinner from "./spinner";
import humanizeDuration from "humanize-duration";
import { useAuditStats } from "./swr";

export default function AuditStats() {
  const {
    auditStats: stats,
    isLoading: loading,
    isError: error
  } = useAuditStats(true);
  if (!loading && !error) {
    const percentage =
      (stats.dar.valid
        ? stats.dar.valid.correct / stats.dar.valid.total
        : stats.dar.correct / stats.dar.total) * 100;
    const oldest = new Date(stats.timeRange.oldest);
    const latest = new Date(stats.timeRange.latest);
    return (
      <>
        <h2 className="inline text-lg font-medium leading-6 text-gray-900">
          Cumulative audit statistics
        </h2>

        <p className="text-sm text-gray-500">
          Analysis based on{" "}
          <span className="font-medium">
            {stats.dar.total.toLocaleString()}
          </span>{" "}
          group audit log records between{" "}
          <span className="font-medium">{oldest.toDateString()}</span> and{" "}
          <span className="font-medium">{latest.toDateString()}</span>
        </p>

        <div className="my-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col">
            <dt className="order-2 text-base font-medium text-gray-500">
              accuracy rate (DAR)*
            </dt>
            <dd className="order-1 text-xl font-extrabold text-slate-700 sm:text-2xl">
              {`${percentage.toFixed(2)}%`}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="order-2 text-base font-medium text-gray-500">
              avg. decision time (MTBD)
            </dt>
            <dd className="order-1 text-xl font-extrabold text-slate-700 sm:text-2xl">
              {`${humanizeDuration(stats.mtbd * 1000)}`}
            </dd>
          </div>
          {/* <div className="flex flex-col">
            <dt className="order-2 text-base font-medium text-gray-500">
              decision-making staff
            </dt>
            <dd className="order-1 text-2xl font-extrabold text-slate-700 sm:text-3xl">
              {stats.actors.toLocaleString()}
            </dd>
          </div> */}
          <div className="flex flex-col">
            <dt className="order-2 text-base font-medium text-gray-500">
              correct* decisions
            </dt>
            <dd className="order-1 text-xl font-extrabold text-slate-700 sm:text-2xl">
              {(stats.dar.valid
                ? stats.dar.valid.correct
                : stats.dar.correct
              ).toLocaleString()}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="order-2 text-base font-medium text-gray-500">
              wrong* decisions
            </dt>
            <dd className="order-1 text-xl font-extrabold text-slate-700 sm:text-2xl">
              {(stats.dar.valid
                ? stats.dar.valid.total - stats.dar.valid.correct
                : stats.dar.total - stats.dar.correct
              ).toLocaleString()}
            </dd>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            *as determined by MECS, where automated review date is within 1 day
            of actual decision date
          </p>
        </div>
      </>
    );
  }
  return (
    <div className="py-24">
      <Spinner />
    </div>
  );
}
