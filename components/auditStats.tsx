import Spinner from "./spinner";
import humanizeDuration from "humanize-duration";
import { useAuditStats } from "./swr";
import { motion, AnimatePresence } from "motion/react";
import { AnimateNumber } from "motion-plus/react";

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

    const statItems = [
      {
        label: "accuracy rate (DAR)*",
        value: percentage,
        decimals: 2,
        suffix: "%"
      },
      {
        label: "avg. decision time (MTBD)",
        displayValue: humanizeDuration(stats.mtbd * 1000)
      },
      {
        label: "correct* decisions",
        value: stats.dar.valid
          ? stats.dar.valid.correct
          : stats.dar.correct
      },
      {
        label: "wrong* decisions",
        value: stats.dar.valid
          ? stats.dar.valid.total - stats.dar.valid.correct
          : stats.dar.total - stats.dar.correct
      }
    ];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="inline text-lg leading-6 font-medium text-gray-900">
            Cumulative audit statistics
          </h2>

          <p className="text-sm text-gray-500">
            Analysis based on{" "}
            <span className="font-medium">
              {stats.dar.total.toLocaleString()}
            </span>{" "}
            group audit log records between{" "}
            <span className="font-medium">{oldest.toDateString()}</span>{" "}
            and{" "}
            <span className="font-medium">{latest.toDateString()}</span>
          </p>

          <div className="my-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                className="flex flex-col"
              >
                <dt className="order-2 text-base font-medium text-gray-500">
                  {item.label}
                </dt>
                <dd className="order-1 text-xl font-extrabold text-slate-700 sm:text-2xl">
                  {item.displayValue ? (
                    item.displayValue
                  ) : (
                    <>
                      <AnimateNumber
                        transition={{
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                      >
                        {item.value ?? 0}
                      </AnimateNumber>
                      {item.suffix && (
                        <span>{item.suffix}</span>
                      )}
                    </>
                  )}
                </dd>
              </motion.div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              *as determined by MECS, where automated review date is
              within 1 day of actual decision date
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
  return (
    <div className="py-24">
      <Spinner />
    </div>
  );
}
