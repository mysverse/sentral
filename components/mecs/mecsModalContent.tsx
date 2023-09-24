import { useState, Fragment, Dispatch, SetStateAction } from "react";
import { Transition, Dialog } from "@headlessui/react";
import Image from "next/image";
import humanizeDuration from "humanize-duration";
import { format } from "date-fns";

import Spinner from "../spinner";
import { DefaultAPIResponse, StaffDecision } from "../apiTypes";
import { isStandalonePWA } from "../utils";
import { clsx } from "clsx";
import { useAvatarThumbnails, useCombinedBlacklistData } from "../swr";

import {
  CheckCircleIcon,
  CheckIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/20/solid";

interface resultCard {
  name: string;
  pass: boolean;
  displayText: string;
  title: string;
  subtitle: string;
  informational?: boolean;
}

function RankHistoryFeed({ history }: { history: StaffDecision[] }) {
  if (history.length === 0) {
    return null;
  }
  return (
    <>
      <h2 className="mb-6 text-lg font-medium leading-6 text-gray-900">
        {`Ranking history`}
      </h2>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {history.map((event, eventIdx) => {
            let reviewable = false;
            let automated = event.officer === 2334567007;
            if (event.timestamps.review && !automated) {
              reviewable =
                new Date(event.timestamps.action).toDateString() ===
                new Date(event.timestamps.review).toDateString();
            }
            return (
              <li key={eventIdx}>
                <div className="relative pb-8">
                  {eventIdx !== history.length - 1 ? (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={clsx(
                          event.correct || !reviewable
                            ? "bg-gray-400"
                            : "bg-red-400",
                          "flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white"
                        )}
                      >
                        {event.action === "Grant" ? (
                          <CheckIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        ) : (
                          <XMarkIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          {event.action === "Grant"
                            ? `Membership granted `
                            : `Membership rejected `}{" "}
                          {automated ? (
                            <>
                              {"via "}
                              <a
                              // href={`https://roblox.com/users/${event.officer}`}
                              // className="font-medium"
                              >
                                automated review
                              </a>
                            </>
                          ) : (
                            <>
                              {"by staff member "}
                              <a
                                href={`https://roblox.com/users/${event.officer}`}
                                className="font-medium text-gray-900 hover:underline"
                              >
                                {event.officerName
                                  ? `@${event.officerName}`
                                  : event.officer}
                              </a>
                            </>
                          )}
                          {reviewable ? (
                            <>
                              {event.correct ? (
                                <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 sm:ml-3 sm:inline">
                                  Correct decision
                                </span>
                              ) : (
                                <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500 sm:ml-3 sm:inline">
                                  Wrong decision
                                </span>
                              )}
                              {!event.correct &&
                              event.action === "Refusal" &&
                              eventIdx === 0 ? (
                                <span className="ml-3 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                                  Appeal suggested
                                </span>
                              ) : null}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time
                          dateTime={event.timestamps.action.substring(0, 10)}
                        >
                          {format(
                            new Date(event.timestamps.action),
                            "dd MMM yy"
                          )}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function calculateTrustFactor(data: DefaultAPIResponse) {
  const tests = data.tests;
  const count = {
    pass: 0,
    total: 0
  };

  const passScore = 0.75;
  let calculatedScore = 0;

  for (const key in tests) {
    const testData = tests[key];
    if (testData) {
      if (key !== "blacklist") {
        count.total++;
        if (testData.status === true) {
          count.pass++;
        }
      }
    }
  }
  if (count.total > 0) {
    calculatedScore = count.pass / count.total;
    if (calculatedScore >= passScore) {
      return [true, calculatedScore] as [boolean, number];
    }
  }
  return [false, calculatedScore] as [boolean, number];
}

function BlacklistSlideover({
  open,
  setOpen,
  type,
  setType
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  type: "users" | "groups";
  setType: Dispatch<SetStateAction<"users" | "groups">>;
}) {
  const { apiResponse, isLoading, isError } = useCombinedBlacklistData(true);

  if (isLoading || isError) {
    return null;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={setOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Blacklisted
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-slate-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-gray-200">
                    <div className="px-6">
                      <nav
                        className="-mb-px flex space-x-6"
                        x-descriptions="Tab component"
                      >
                        {[
                          {
                            name: "Users",
                            value: "users" as "users" | "groups"
                          },
                          {
                            name: "Groups",
                            value: "groups" as "users" | "groups"
                          }
                        ].map((tab) => (
                          <div
                            key={tab.value}
                            className={clsx(
                              tab.value === type
                                ? "border-slate-500 text-slate-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                              "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium hover:cursor-pointer"
                            )}
                            onClick={(e) => setType(tab.value)}
                          >
                            {tab.name}
                          </div>
                        ))}
                      </nav>
                    </div>
                  </div>
                  <ul
                    role="list"
                    className="flex-1 divide-y divide-gray-200 overflow-y-auto"
                  >
                    {(type === "groups"
                      ? apiResponse.groups
                      : apiResponse.users
                    )
                      .sort((a, b) =>
                        a.name && b.name
                          ? a.name.toLowerCase() > b.name.toLowerCase()
                            ? 1
                            : b.name.toLowerCase() > a.name.toLowerCase()
                            ? -1
                            : 0
                          : 0
                      )
                      .map((item) => (
                        <li key={item.id}>
                          <div className="group relative flex items-center px-5 py-6">
                            <a
                              href={
                                type === "groups"
                                  ? `https://roblox.com/groups/${item.id}`
                                  : `https://roblox.com/users/${item.id}`
                              }
                              className="-m-1 block flex-1 p-1"
                            >
                              <div
                                className="absolute inset-0 group-hover:bg-gray-50"
                                aria-hidden="true"
                              />
                              <div className="relative flex min-w-0 flex-1 items-center">
                                <div className="truncate">
                                  <p className="truncate text-sm font-medium text-gray-900">
                                    {type === "groups"
                                      ? item.name
                                      : `@${item.name}`}
                                  </p>
                                  <p className="w-72 whitespace-normal text-sm text-gray-500">
                                    {item.reason}
                                  </p>
                                </div>
                              </div>
                            </a>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function getRoleText(text: string) {
  if (text !== null && typeof text !== "undefined") {
    if (text.includes("Immigration Detention Centre")) {
      return "Membership rejected";
    } else if (text.includes("Immigrant Office")) {
      return "Membership pending";
    }
    const roles = text.split("|");
    if (!isStandalonePWA() && roles.length > 0) {
      return `Member - ${roles[0]}`;
    }
    return "Member";
  } else {
    return "Non-member";
  }
}

export default function QueryModalContent({
  apiResponse,
  loading,
  error
}: {
  apiResponse: DefaultAPIResponse;
  loading: boolean;
  error: boolean;
}) {
  const resultCards: resultCard[] = [];
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"users" | "groups">("users");
  const [pass, failReasons] = (() => {
    const failReasons = [] as JSX.Element[];
    if (!loading && !error) {
      const tests = apiResponse.tests;

      const [tfPass, tfScore] = calculateTrustFactor(apiResponse);

      const keys = {
        mandatory: ["age", "blacklist"],
        trustFactor: ["accessory", "badges", "friends", "groups"]
      };

      const getSubtitle = (input: string | undefined) =>
        typeof input !== "undefined" ? input : "Unavailable";

      resultCards.push({
        name: "trustFactor",
        title: "Trust Factor",
        subtitle: "75% score and above",
        displayText: `${Math.floor(tfScore * 100).toString()}%`,
        pass: tfPass
      });

      for (const key of keys.mandatory.concat(keys.trustFactor)) {
        let informational = false;
        if (keys.trustFactor.includes(key)) {
          informational = true;
        }
        const result = tests[key];
        if (result) {
          let title = key[0].toUpperCase() + key.slice(1);
          let displayText =
            typeof result.values.current === "string" ||
            typeof result.values.current === "number"
              ? `${result.values.current}`
              : result.status
              ? "PASS"
              : "FAIL";

          switch (key) {
            case "age":
              const days = result.values.current;
              const duration = days * 24 * 60 * 60 * 1000;
              title = "Account Age";
              displayText =
                days > 60
                  ? humanizeDuration(duration, {
                      units: ["y", "mo"],
                      largest: 1,
                      round: true
                    })
                  : humanizeDuration(duration, {
                      units: ["d"],
                      largest: 1,
                      round: true
                    });
              break;

            default:
              break;
          }
          if (!result.status) {
            if (key === "age") {
              const date = new Date();
              const duration =
                (result.values.pass - result.values.current) *
                24 *
                60 *
                60 *
                1000;
              date.setDate(
                date.getDate() + (result.values.pass - result.values.current)
              );
              failReasons.push(
                <>
                  {`Player's account age is below ${
                    result.values.pass
                  } days. Wait around ${humanizeDuration(duration, {
                    units: ["d"],
                    largest: 1,
                    round: true
                  })} (${date.toLocaleDateString()}) for this requirement to pass.`}
                </>
              );
            } else if (key === "blacklist") {
              const reason = apiResponse.tests.blacklist.metadata
                ?.reason as string;
              const ind = apiResponse.tests.blacklist.metadata?.player
                ? true
                : false;
              const array = apiResponse.tests.blacklist.metadata
                ?.group as any[];
              const group = Array.isArray(array) ? array.length > 0 : false;
              if (ind && group) {
                failReasons.push(
                  <>
                    <>{`Player is individually blacklisted ${
                      reason ? `(reason: "${reason}")` : null
                    } and in ${apiResponse.tests.blacklist.metadata?.group
                      .length} blacklisted group${
                      array.length > 1 ? "s" : ""
                    }`}</>
                    <ul className="list-disc pl-4">
                      {array.map((group) => (
                        <li key={group.id}>
                          <a
                            href={`https://roblox.com/groups/${group.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:no-underline"
                          >
                            {group.name}
                          </a>
                          {group.reason ? ` - "${group.reason}"` : null}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              } else if (ind) {
                failReasons.push(
                  <>
                    Player is individually blacklisted{" "}
                    {reason ? `(reason: "${reason}")` : null}
                  </>
                );
              } else if (group) {
                failReasons.push(
                  <>
                    <>{`Player is in ${apiResponse.tests.blacklist.metadata
                      ?.group.length} blacklisted group${
                      array.length > 1 ? "s" : ""
                    }`}</>
                    <ul className="list-disc pl-4">
                      {array.map((group) => (
                        <li key={group.id}>
                          <a
                            href={`https://roblox.com/groups/${group.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:no-underline"
                          >
                            {group.name}
                          </a>
                          {group.reason ? ` - "${group.reason}"` : null}
                        </li>
                      ))}
                    </ul>
                  </>
                );
              }
            }
          }
          resultCards.push({
            name: key,
            title: title,
            subtitle: getSubtitle(result.descriptions?.pass),
            displayText: displayText,
            pass: result.status,
            informational: informational
          });
        }
      }

      resultCards.push({
        name: "hcc",
        title: "HCC gamepass",
        subtitle: "Gamepass ownership check",
        displayText: apiResponse.user.hccGamepassOwned ? "PASS" : "FAIL",
        pass: apiResponse.user.hccGamepassOwned ? true : false,
        informational: true
      });

      if (!tfPass) {
        failReasons.push(<>{`Player's trust factor score is too low.`}</>);
      }
      const pass = tests.age.status && tests.blacklist.status && tfPass;
      return [pass, failReasons] as [boolean, JSX.Element[]];
    }
    return [false, failReasons] as [boolean, JSX.Element[]];
  })();

  const { stats: avatarData } = useAvatarThumbnails(
    apiResponse ? true : false,
    apiResponse ? [apiResponse.user.userId] : []
  );

  return (
    <>
      <BlacklistSlideover
        open={open}
        setOpen={setOpen}
        type={type}
        setType={setType}
      />
      {!loading && !error ? (
        <>
          <div className="mb-6 flex flex-col items-center sm:flex-row sm:space-x-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <Image
                  className="rounded-full"
                  width={100}
                  height={100}
                  src={
                    avatarData
                      ? avatarData.data.find(
                          (avatarItem) =>
                            avatarItem.targetId === apiResponse.user.userId
                        )?.imageUrl || "/img/user_placeholder.webp"
                      : "/img/user_placeholder.webp"
                  }
                  alt={`Profile picture of player @${apiResponse.user.username}`}
                />
                <span
                  className="absolute inset-0 rounded-full shadow-inner"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="truncate text-center sm:text-left">
              <a
                href={`https://roblox.com/users/${apiResponse.user.userId}`}
                className="hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                <h1 className="text-2xl font-bold text-gray-900">
                  @{apiResponse.user.username}
                </h1>
              </a>
              {/* <span className="px-2 py-1 text-sm bg-slate-100 rounded-md">
                {apiResponse.user.userId}
              </span> */}
              <p className="text-sm font-medium text-gray-500">
                {getRoleText(apiResponse.user.groupMembership?.role.name)}
                {/* <a href="#" className="text-gray-900">
                  Front End Developer
                </a>{" "}
                on <time dateTime="2020-08-25">August 25, 2020</time> */}
              </p>
            </div>
          </div>
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            {`Criteria results`}
          </h2>
          {apiResponse.user.exempt ? (
            <div className="my-4 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon
                    className="h-5 w-5 text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    {`@${apiResponse.user.username}`} is in a role exempt from
                    criteria-based eligibility checks.
                  </p>
                </div>
              </div>
            </div>
          ) : pass ? (
            <div className="my-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {`@${apiResponse.user.username}`} meets minimum system
                    criteria for membership.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {`@${apiResponse.user.username}`} failed to meet{" "}
                    {`${failReasons.length}`} mandatory criteria:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul role="list" className="list-disc space-y-1 pl-5">
                      {failReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Mandatory criteria
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {resultCards.map((item) => {
                const mandatoryKeys = ["age", "blacklist", "trustFactor"];
                if (mandatoryKeys.includes(item.name)) {
                  if (item.name === "blacklist") {
                    if (item.pass) {
                      item.displayText = "None";
                    } else {
                      const ind = apiResponse.tests.blacklist.metadata?.player
                        ? true
                        : false;
                      const group = Array.isArray(
                        apiResponse.tests.blacklist.metadata?.group
                      )
                        ? apiResponse.tests.blacklist.metadata?.group.length > 0
                        : false;
                      item.displayText =
                        ind && group
                          ? "Multiple"
                          : ind
                          ? "Individual"
                          : group
                          ? "Group"
                          : "Yes";
                    }
                  }
                  return (
                    <div
                      key={item.name}
                      className={clsx(
                        item.pass ? "bg-white" : "bg-red-50",
                        "overflow-hidden rounded-lg px-3 py-3 outline outline-1 outline-gray-200 sm:p-3"
                      )}
                    >
                      <dt
                        className={clsx(
                          item.pass ? "text-gray-500" : "text-red-700",
                          "truncate text-sm font-medium"
                        )}
                      >
                        {item.title}
                      </dt>
                      <dd
                        className={clsx(
                          item.pass ? "text-gray-900" : "text-red-800",
                          "mt-1 text-2xl font-semibold"
                        )}
                      >
                        {item.displayText}
                      </dd>
                    </div>
                  );
                }
              })}
            </dl>
          </div>
          <h2 className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-500">
            Trust factor scoring criteria
          </h2>
          <ul
            role="list"
            className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {resultCards.map((card) => {
              const keys = ["accessory", "badges", "friends", "groups"];
              if (keys.includes(card.name)) {
                return (
                  <li
                    key={card.name}
                    className="col-span-1 flex rounded-md shadow-sm"
                  >
                    <div
                      className={clsx(
                        card.informational === true
                          ? "bg-slate-400"
                          : card.pass
                          ? "bg-green-500"
                          : "bg-red-500",
                        "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
                      )}
                    >
                      {card.displayText === "PASS" ? (
                        <CheckIcon className="h-8 w-8" />
                      ) : card.displayText === "FAIL" ? (
                        <XMarkIcon className="h-8 w-8" />
                      ) : (
                        card.displayText
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                      <div className="flex-1 truncate px-4 py-2 text-sm">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                          {card.title}
                        </span>
                        <p className="truncate text-gray-500">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              }
            })}
          </ul>
          <h2 className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-500">
            Miscallaneous information
          </h2>
          <ul role="list" className="mt-3 grid grid-cols-1 gap-3">
            {resultCards.map((card) => {
              const keys = ["hcc"];
              if (keys.includes(card.name)) {
                return (
                  <li
                    key={card.name}
                    className="col-span-1 flex rounded-md shadow-sm"
                  >
                    <div
                      className={clsx(
                        card.informational === true
                          ? "bg-slate-400"
                          : card.pass
                          ? "bg-green-500"
                          : "bg-red-500",
                        "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
                      )}
                    >
                      {card.displayText === "PASS" ? (
                        <CheckIcon className="h-8 w-8" />
                      ) : card.displayText === "FAIL" ? (
                        <XMarkIcon className="h-8 w-8" />
                      ) : (
                        card.displayText
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                      <div className="flex-1 truncate px-4 py-2 text-sm">
                        <span className="font-medium text-gray-900 hover:text-gray-600">
                          {card.title}
                        </span>
                        <p className="text-gray-500">{card.subtitle}</p>
                      </div>
                    </div>
                  </li>
                );
              }
            })}
          </ul>
          <div className="my-8">
            <RankHistoryFeed
              history={apiResponse.history ? apiResponse.history : []}
            />
          </div>
          {apiResponse.tests.blacklist.metadata?.src?.docs &&
          !isStandalonePWA() ? (
            <>
              <div className="my-3 mt-6 flex justify-center">
                <div className="relative z-0 inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      setType("users");
                      setOpen(true);
                    }}
                    className="relative inline-flex h-full items-center rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    List of blacklisted individuals
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setType("groups");
                      setOpen(true);
                    }}
                    className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    List of blacklisted groups
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : error ? (
        <>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationCircleIcon
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Uh oh, we hit a snag
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  The user you are querying might not exist, or there may be a
                  problem with your input.
                </p>
                <p className="text-sm text-gray-500">
                  It is also possible the server is down, in which case please
                  try again at a later time.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-24">
          <Spinner />
        </div>
      )}
    </>
  );
}
