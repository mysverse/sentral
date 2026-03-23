import Image from "next/image";
import Spinner from "../spinner";
import { useAvatarThumbnails, useStaffStats } from "../swr";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export default function StaffStats({ limit }: { limit?: number }) {
  const {
    staffStats: stats,
    isLoading: loading,
    isError: error
  } = useStaffStats(true);

  const { stats: avatarData } = useAvatarThumbnails(
    stats ? true : false,
    stats ? stats.map((item) => item.officer.id) : []
  );

  return (
    <AnimatePresence mode="wait">
      {!loading && !error ? (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="inline text-lg leading-6 font-medium text-gray-900">
              {limit
                ? `Most active membership staff`
                : `All membership staff`}
            </h2>
            <span className="ml-3 inline text-sm text-slate-800 hover:underline">
              {limit ? (
                <Link href="/dashboard/mecs/staff">View staff page</Link>
              ) : (
                <Link href="/dashboard/mecs">Back to MECS</Link>
              )}
            </span>
          </motion.div>

          <div className="my-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {(limit ? stats.slice(0, limit) : stats).map((item, index) => (
              <motion.div
                key={item.officer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center md:flex-row md:space-x-5"
              >
                <div className="shrink-0">
                  <div className="relative">
                    <a
                      href={`https://roblox.com/users/${item.officer.id}`}
                      className="hover:underline"
                    >
                      <Image
                        className="rounded-full"
                        width={75}
                        height={75}
                        src={
                          avatarData
                            ? avatarData.data.find(
                                (avatarItem) =>
                                  avatarItem.targetId === item.officer.id
                              )?.imageUrl || "/img/user_placeholder.webp"
                            : "/img/user_placeholder.webp"
                        }
                        alt={`Profile picture of player @${item.officer.name}`}
                        unoptimized
                      />
                      <span
                        className="absolute inset-0 rounded-full shadow-inner"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
                <div className="truncate text-center md:text-left">
                  <a
                    href={`https://roblox.com/users/${item.officer.id}`}
                    className="hover:underline"
                  >
                    <h1 className="truncate text-lg font-bold text-gray-900">
                      @{item.officer.name}
                    </h1>
                  </a>
                  <p className="text-sm font-normal text-gray-500">
                    DAR{" "}
                    <span className="font-medium">
                      {(item.decisions.dar.data.valid
                        ? (item.decisions.dar.data.valid.correct /
                            item.decisions.dar.data.valid.total) *
                          100
                        : item.decisions.dar.percentage
                      ).toFixed(2)}
                      %
                    </span>{" "}
                    {item.decisions.atbd ? (
                      <>
                        · MTBD{" "}
                        <span className="font-medium">
                          {item.decisions.atbd?.mtbd?.mode > 99
                            ? ">99 s"
                            : `${item.decisions.atbd?.mtbd?.mode} s`}
                        </span>
                      </>
                    ) : null}
                  </p>
                  <p className="text-sm font-normal text-gray-500">
                    <span className="font-medium">
                      {item.decisions.dar.data.total.toLocaleString()}
                    </span>{" "}
                    total decision
                    {item.decisions.dar.data.total > 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="py-24"
        >
          <Spinner />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
