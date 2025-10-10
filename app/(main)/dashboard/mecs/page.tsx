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
import DefaultTransitionLayout from "components/transition";
import dynamic from "next/dynamic";
import BlacklistSlideover from "components/mecs/BlacklistSlideover";

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
      error={isError !== null && typeof isError !== "undefined"}
    />
  );
  return (
    <>
      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={(e) => e.preventDefault()}
      >
        {!modalOpen ? (
          <>
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Membership eligibility query
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter any valid username or user ID
                  </p>
                </div>
                <div className="mt-4 sm:flex sm:w-full sm:max-w-full">
                  <div className="flex rounded-md shadow-xs">
                    <select
                      id="input_type"
                      name="input_type"
                      autoComplete="input_type"
                      className="block w-full rounded-md border-gray-300 focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                      onChange={(e) => {
                        setTreatAsUserId(e.target.value === "User ID");
                        setCurrentUsername("");
                        setChangeFlag(false);
                        // alert(treatAsUserId);
                      }}
                      defaultValue={treatAsUserId ? "User ID" : "Username"}
                      // disabled={!templates}
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
                        className="block w-full min-w-0 flex-1 rounded-md border-gray-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
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
                            // Cancel the default action, if needed
                            event.preventDefault();
                            // Trigger the button element with a click
                            document.getElementById("btn_search")?.click();
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          name="roblox_username"
                          id="roblox_username"
                          className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
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
                              // Cancel the default action, if needed
                              event.preventDefault();
                              // Trigger the button element with a click
                              document.getElementById("btn_search")?.click();
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-3">
                    <button
                      type="button"
                      id="btn_search"
                      onClick={() => {
                        if (treatAsUserId) {
                          if (!Number.isNaN(parseInt(username)) && changeFlag) {
                            setCurrentUsername(username);
                            setModalOpen(true);
                            plausible("mecsSubmit", {
                              props: {
                                query: username,
                                type: "id"
                              }
                            });
                          } else {
                            alert(
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
                            alert("That doesn't look like a valid username.");
                          }
                        }
                      }}
                      className="block w-full rounded-md border border-transparent bg-blue-700 px-5 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-hidden disabled:bg-slate-400 sm:px-24"
                    >
                      Check
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
        {modalOpen ? (
          <>
            <div>
              <div className="bg-white">{modalContent}</div>
              {!isLoading ? (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    id="btn_dismiss"
                    onClick={() => setModalOpen(false)}
                    className="mt-4 block rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-hidden sm:px-24 sm:text-sm"
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
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
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Check blacklists
            </h3>
            <p className="mt-1 text-sm text-gray-500">
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
                className="relative inline-flex h-full items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
              >
                List of blacklisted individuals
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("groups");
                  setOpen(true);
                }}
                className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-hidden"
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
    <div className="mx-auto my-auto max-w-7xl grow px-4 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <MECSForm />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <BlacklistSection />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <AuditStats />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <StaffStats limit={4} />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Memberships granted and rejected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Trend and values over the last 12 months
          </p>
          <div className="mt-6">
            <div className="relative h-[24rem] w-[99%]">
              <MECSChart />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Membership approval rate
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Trend and values over the last 12 months
          </p>
          <div className="mt-6">
            <div className="relative h-[24rem] w-[99%]">
              <MECSChart2 />
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <MECSFAQ />
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
