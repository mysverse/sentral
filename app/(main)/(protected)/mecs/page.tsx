"use client";

import { useEffect, useState } from "react";

import QueryModalContent from "components/mecs/mecsModalContent";

import AuditStats from "components/auditStats";
import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";
import { useUserData } from "components/swr";
import { isStandalonePWA } from "components/utils";
// import { useRouter } from "next/router";
import MECSChart from "components/mecs/mecsChart";
import MECSChart2 from "components/mecs/mecsChart2";
import { usePlausible } from "next-plausible";
import { useSearchParams } from "next/navigation";

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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Membership eligibility query
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter any valid username or user ID
                  </p>
                </div>
                <div className="mt-4 sm:max-w-full sm:w-full sm:flex">
                  <div className="flex rounded-md shadow-sm">
                    <select
                      id="input_type"
                      name="input_type"
                      autoComplete="input_type"
                      className="focus:ring-slate-500 focus:border-slate-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  <div className="mt-4 sm:mt-0 sm:ml-3 min-w-0 flex flex-1 rounded-md shadow-sm">
                    <label htmlFor="roblox_username" className="sr-only">
                      {isStandalonePWA() ? "Username" : "Roblox username"}
                    </label>

                    {treatAsUserId ? (
                      <input
                        type="text"
                        name="roblox_userid"
                        id="roblox_userid"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md focus:ring-slate-500 focus:border-slate-500 sm:text-sm border-gray-300"
                        placeholder={"Player user ID"}
                        onChange={(evt) => {
                          setUsername(evt.target.value);
                          setChangeFlag(true);
                        }}
                        onInput={(evt) => {
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
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          name="roblox_username"
                          id="roblox_username"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-slate-500 focus:border-slate-500 sm:text-sm border-gray-300"
                          placeholder={"Player username"}
                          onChange={(evt) => {
                            setUsername(evt.target.value);
                            setChangeFlag(true);
                          }}
                          onInput={(evt) => {
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
                      onClick={(evt) => {
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
                      className="block w-full rounded-md border border-transparent px-5 py-2 text-base font-medium text-white shadow bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 sm:px-24"
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
                <div className="flex justify-center mt-5">
                  <button
                    type="button"
                    id="btn_dismiss"
                    onClick={(evt) => setModalOpen(false)}
                    className="mt-4 block rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:px-24 sm:text-sm"
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
    <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
        <MECSForm />
      </div>
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
        <AuditStats />
      </div>
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
        <StaffStats limit={4} />
      </div>
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
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
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
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
      <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
        <MECSFAQ />
      </div>
    </div>
  );
}
