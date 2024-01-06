"use client";

import { useEffect, useState } from "react";

import QueryModalContent from "components/mecs/mecsModalContent";

import AuditStats from "components/auditStats";
import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";
import { useUserData } from "components/swr";
import { isStandalonePWA } from "components/utils";
import MECSChart from "components/mecs/mecsChart";
import MECSChart2 from "components/mecs/mecsChart2";
import { usePlausible } from "next-plausible";
import { useSearchParams } from "next/navigation";
import DefaultTransitionLayout from "components/transition";

const regex = /^(?=^[^_]+_?[^_]+$)\w{3,20}$/;

function MECSForm() {
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [changeFlag, setChangeFlag] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [treatAsUserId, setTreatAsUserId] = useState(false);
  const query = useSearchParams();

  useEffect(() => {
    const user = query.get("user");
    if (user && !Array.isArray(user)) {
      if (regex.test(user)) {
        setCurrentUsername(user);
        setModalOpen(true);
      }
    }
  }, [query]);

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
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Membership eligibility query
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter any valid username or user ID
                  </p>
                </div>
                <div className="mt-4 sm:flex sm:w-full sm:max-w-full">
                  <div className="flex rounded-md shadow-sm">
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
                  <div className="mt-4 flex min-w-0 flex-1 rounded-md shadow-sm sm:ml-3 sm:mt-0">
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
                  <div className="mt-4 sm:ml-3 sm:mt-0">
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
                      className="block w-full rounded-md border border-transparent bg-blue-700 px-5 py-2 text-base font-medium text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-400 sm:px-24"
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
                    className="mt-4 block rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:px-24 sm:text-sm"
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

export default function MecsPage() {
  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <MECSForm />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <AuditStats />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <StaffStats limit={4} />
        </div>
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
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
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
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
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <MECSFAQ />
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
