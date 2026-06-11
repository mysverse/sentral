"use client";

import { useState } from "react";

import QueryModalContent from "components/mecs/mecsModalContent";

import AuditStats from "components/auditStats";
import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";
import { useUserData } from "components/swr";
import { isStandalonePWA } from "components/utils";
const MECSChart = dynamic(() => import("components/mecs/mecsChart"));
const MECSChart2 = dynamic(() => import("components/mecs/mecsChart2"));
import { usePlausible } from "next-plausible";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import BlacklistSlideover from "components/mecs/BlacklistSlideover";
import { motion, AnimatePresence } from "motion/react";
import { springUI } from "components/ui/motion";
import { toast } from "sonner";

const regex = /^(?=^[^_]+_?[^_]+$)\w{3,20}$/;

function MECSForm() {
  const query = useSearchParams();

  // Initialize state from search params
  const getUserFromParams = () => {
    const user = query.get("user");
    if (user && !Array.isArray(user) && regex.test(user)) {
      return user;
    }
    return "";
  };

  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState(getUserFromParams);
  const [changeFlag, setChangeFlag] = useState(false);
  const [modalOpen, setModalOpen] = useState(!!getUserFromParams());
  const [treatAsUserId, setTreatAsUserId] = useState(false);

  const shouldFetch = modalOpen && currentUsername.trim().length > 0;

  const plausible = usePlausible();

  const { apiResponse, isLoading, isError } = useUserData(
    currentUsername,
    shouldFetch,
    treatAsUserId
  );

  const modalContent = (
    <QueryModalContent
      apiResponse={apiResponse}
      loading={isLoading}
      error={isError}
    />
  );
  return (
    <>
      <form
        className="divide-edge space-y-8 divide-y"
        onSubmit={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {!modalOpen ? (
            <motion.div
              key="search-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="divide-edge space-y-8 divide-y sm:space-y-5">
                <div>
                  <div>
                    <h3 className="text-strong text-lg leading-6 font-medium">
                      Membership eligibility query
                    </h3>
                    <p className="text-muted mt-1 text-sm">
                      Enter any valid username or user ID
                    </p>
                  </div>
                  <div className="mt-4 sm:flex sm:w-full sm:max-w-full">
                    <div className="flex rounded-md shadow-xs">
                      <select
                        id="input_type"
                        name="input_type"
                        autoComplete="input_type"
                        className="border-edge block w-full rounded-md focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                        onChange={(e) => {
                          setTreatAsUserId(e.target.value === "User ID");
                          setCurrentUsername("");
                          setChangeFlag(false);
                        }}
                        defaultValue={treatAsUserId ? "User ID" : "Username"}
                      >
                        <option>Username</option>
                        <option>User ID</option>
                      </select>
                    </div>
                    <div className="mt-4 flex min-w-0 flex-1 rounded-md shadow-xs sm:mt-0 sm:ml-3">
                      <label htmlFor="roblox_username" className="sr-only">
                        {isStandalonePWA() ? "Username" : "Roblox username"}
                      </label>

                      {treatAsUserId ? (
                        <input
                          type="text"
                          name="roblox_userid"
                          id="roblox_userid"
                          className="border-edge block w-full min-w-0 flex-1 rounded-md px-3 py-2 focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                          placeholder={"Player user ID"}
                          onChange={(evt) => {
                            setUsername(evt.target.value);
                            setChangeFlag(true);
                          }}
                          onInput={() => {
                            setChangeFlag(true);
                          }}
                          onKeyUp={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              document.getElementById("btn_search")?.click();
                            }
                          }}
                        />
                      ) : (
                        <>
                          <span className="border-edge bg-surface-muted text-muted inline-flex items-center rounded-l-md border border-r-0 px-3 sm:text-sm">
                            @
                          </span>
                          <input
                            type="text"
                            name="roblox_username"
                            id="roblox_username"
                            className="border-edge block w-full min-w-0 flex-1 rounded-none rounded-r-md px-3 py-2 focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                            placeholder={"Player username"}
                            onChange={(evt) => {
                              setUsername(evt.target.value);
                              setChangeFlag(true);
                            }}
                            onInput={() => {
                              setChangeFlag(true);
                            }}
                            onKeyUp={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                document.getElementById("btn_search")?.click();
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-3">
                      <motion.button
                        type="button"
                        id="btn_search"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (treatAsUserId) {
                            if (
                              !Number.isNaN(parseInt(username)) &&
                              changeFlag
                            ) {
                              setCurrentUsername(username);
                              setModalOpen(true);
                              plausible("mecsSubmit", {
                                props: {
                                  query: username,
                                  type: "id"
                                }
                              });
                            } else {
                              toast.error(
                                "That doesn't look like a valid user ID. User IDs should only consist of numbers."
                              );
                            }
                          } else {
                            if (regex.test(username) && changeFlag) {
                              setCurrentUsername(username);
                              setModalOpen(true);
                              plausible("mecsSubmit", {
                                props: {
                                  query: username,
                                  type: "username"
                                }
                              });
                            } else {
                              toast.error(
                                "That doesn't look like a valid username."
                              );
                            }
                          }
                        }}
                        className="bg-primary-700 block w-full rounded-md border border-transparent px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-hidden disabled:bg-slate-400 sm:px-24"
                      >
                        Check
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="query-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-surface">{modalContent}</div>
              {!isLoading ? (
                <div className="mt-5 flex justify-center">
                  <motion.button
                    type="button"
                    id="btn_dismiss"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen(false)}
                    className="border-edge bg-surface text-strong hover:bg-surface-muted mt-4 block rounded-md border px-4 py-2 text-base font-medium shadow-xs focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-hidden sm:px-24 sm:text-sm"
                  >
                    Dismiss
                  </motion.button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </>
  );
}
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
function BlacklistSection() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"users" | "groups">("users");
  return (
    <>
      <BlacklistSlideover
        open={open}
        setOpen={setOpen}
        type={type}
        setType={setType}
      />
      <div className="divide-edge space-y-8 divide-y sm:space-y-5">
        <div>
          <div>
            <h3 className="text-strong text-lg leading-6 font-medium">
              Check blacklists
            </h3>
            <p className="text-muted mt-1 text-sm">
              Browse by individual users or communities
            </p>
          </div>

          <div className="my-4 border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className="size-5 text-yellow-400"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  If you have any enquiries regarding blacklists, submit a
                  complaint ticket in the{" "}
                  <Link
                    href="https://discord.gg/n22p4CMHf4"
                    target="_blank"
                    className="font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                    MYSverse Moderation Discord
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="relative z-0 inline-flex rounded-md shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setType("users");
                  setOpen(true);
                }}
                className="border-edge bg-surface text-strong hover:bg-surface-muted relative inline-flex h-full items-center rounded-l-md border px-4 py-2 text-sm font-medium focus:z-10 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                List of blacklisted individuals
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("groups");
                  setOpen(true);
                }}
                className="border-edge bg-surface text-strong hover:bg-surface-muted relative -ml-px inline-flex items-center rounded-r-md border px-4 py-2 text-sm font-medium focus:z-10 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                List of blacklisted communities
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MecsPage() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        className="bg-surface rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <MECSForm />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ ...springUI, delay: 0.05 }}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <BlacklistSection />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ ...springUI, delay: 0.1 }}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <AuditStats />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <StaffStats limit={4} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        whileHover={{ scale: 1.01 }}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <h3 className="text-strong text-lg leading-6 font-medium">
          Memberships granted and rejected
        </h3>
        <p className="text-muted mt-1 text-sm">
          Trend and values over the last 12 months
        </p>
        <div className="mt-6">
          <div className="relative h-[24rem] w-[99%]">
            <MECSChart />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        whileHover={{ scale: 1.01 }}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <h3 className="text-strong text-lg leading-6 font-medium">
          Membership approval rate
        </h3>
        <p className="text-muted mt-1 text-sm">
          Trend and values over the last 12 months
        </p>
        <div className="mt-6">
          <div className="relative h-[24rem] w-[99%]">
            <MECSChart2 />
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={springUI}
        className="bg-surface mt-6 rounded-lg px-5 py-6 shadow-sm sm:px-6"
      >
        <MECSFAQ />
      </motion.div>
    </div>
  );
}
