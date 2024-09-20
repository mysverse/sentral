"use client";

import { createElement, useState } from "react";

import { ClockIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Button } from "components/catalyst/button";
import { BadgeButton } from "components/catalyst/badge";
import { updatePayoutRequest } from "actions/updatePayout";
import toast from "react-hot-toast";
import Link from "next/link";
import { injectOwnershipAndThumbnailsIntoPayoutRequests } from "utils/finsys";
import { Avatar } from "components/catalyst/avatar";
import Markdown from "react-markdown";

const statuses: { [key: string]: string } = {
  pending: "text-yellow-700",
  approved: "text-green-700",
  rejected: "text-red-700"
};

const regex = /https:\/\/(?:www\.)?roblox\.com\/catalog\/(\d+)\/[\w-]+/g;

function extractRobloxLinks(text: string): string[] {
  const found = text.match(regex);
  return found ? Array.from(new Set(found)) : [];
}

function removeRobloxLinks(text: string): string {
  return text
    .replace(regex, "")
    .replace(/^\d+\.\s*/gm, "")
    .trim();
}

function PayoutRequestsTable({
  payoutRequests,
  adminMode
}: {
  payoutRequests: Awaited<
    ReturnType<typeof injectOwnershipAndThumbnailsIntoPayoutRequests>
  >;
  adminMode?: boolean;
}) {
  // Icon selection based on status
  const [loading, setLoading] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>();
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircleIcon;
      case "rejected":
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {payoutRequests.map((request) => {
        const itemList = extractRobloxLinks(request.reason);
        const ownershipList = request.ownership;
        return (
          <div
            key={request.id}
            className="flex h-full flex-col rounded-lg border p-4"
          >
            <div
              className={clsx(
                "flex items-center justify-between",
                statuses[request.status]
              )}
            >
              <span className="text-2xl font-bold">
                <span className="mr-1 text-base font-medium">R$</span>
                {request.amount}
                {adminMode && (
                  <BadgeButton
                    href={`https://roblox.com/users/${request.user_id}/profile`}
                    target="_blank"
                    color="blue"
                    className="ml-3 align-middle"
                  >
                    {request.user
                      ? `@${request.user.name} (${request.user_id})`
                      : request.user_id}
                  </BadgeButton>
                )}
              </span>

              <div
                className={clsx("flex items-center", statuses[request.status])}
              >
                <span
                  className={
                    "mr-2 text-sm font-medium uppercase tracking-widest"
                  }
                >
                  {request.status}
                </span>
                {createElement(getStatusIcon(request.status), {
                  className: "h-6 w-6",
                  "aria-hidden": "true"
                })}
              </div>
            </div>
            <div className="mt-1">
              <p
                className="mt-1 text-sm text-gray-600"
                suppressHydrationWarning
              >
                Submitted {new Date(request.created_at).toLocaleString()},
                updated {new Date(request.updated_at).toLocaleString()}
              </p>
            </div>
            {request.status === "rejected" && request.rejection_reason && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold">Rejection reason</h3>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                  <Markdown>{request.rejection_reason}</Markdown>
                </p>
              </div>
            )}
            <div className="mt-2">
              <h3 className="text-sm font-semibold">Reason</h3>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600">
                <Markdown>{removeRobloxLinks(request.reason)}</Markdown>
              </p>
            </div>

            {(itemList.length > 0 || ownershipList.length > 0) && (
              <div className="mt-2">
                <h3 className="text-sm font-semibold">List of items</h3>
                <ul className="mt-1 break-words text-sm text-gray-600">
                  {ownershipList
                    ? ownershipList.map((val, index) => {
                        return (
                          <li key={val.id}>
                            <div className="flex flex-row items-center space-x-1">
                              <div>{index + 1}.</div>
                              {val.thumbnail && (
                                <Avatar
                                  className="size-12 scale-125 sm:size-16"
                                  src={val.thumbnail}
                                  square
                                />
                              )}
                              <Link
                                href={`https://roblox.com/catalog/${val.id}`}
                                className="flex flex-col font-medium"
                              >
                                <div>
                                  {val.assetData ? val.assetData.name : val.id}
                                </div>
                                {/* {val.owned ? "owned" : "not owned"} */}
                                {/* {val.assetData?.price &&
                                    `R$ ${val.assetData.price.toLocaleString()}`} */}
                                <span className="text-[0.7rem] font-normal uppercase tracking-wide">
                                  {val.assetData?.creatorName}
                                </span>
                              </Link>
                            </div>
                          </li>
                        );
                      })
                    : itemList.map((val) => {
                        return (
                          <li key={val}>
                            <Link href={val}>{val}</Link>
                          </li>
                        );
                      })}
                  {}
                </ul>
              </div>
            )}

            {ownershipList &&
            ownershipList.length > 0 &&
            ownershipList.reduce(
              (acc, val) => acc + (val.assetData?.price || 0),
              0
            ) !== 0 ? (
              <div className="mt-2">
                <h3 className="text-sm font-semibold">
                  Automatically calculated amount
                </h3>
                <p className="mt-1 break-words text-sm text-gray-600">
                  <b>
                    {ownershipList.reduce(
                      (acc, val) => acc + (val.assetData?.price || 0),
                      0
                    )}{" "}
                    R$
                  </b>
                </p>
              </div>
            ) : (
              itemList.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">
                    Expected amount (based on item list)
                  </h3>
                  <p className="mt-1 break-words text-sm text-gray-600">
                    5 R$ x {itemList.length} = <b>{itemList.length * 5} R$</b>
                  </p>
                </div>
              )
            )}

            {adminMode && request.status === "pending" && (
              <>
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Rejection reason
                  </label>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      name="comment"
                      onChange={(e) => setRejectionReason(e.target.value)}
                      id="comment"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={""}
                    />
                  </div>
                </div>
                <div className="mt-auto flex flex-row gap-x-2 self-end pt-4">
                  <Button
                    onClick={async () => {
                      setLoading(true);

                      const response = await updatePayoutRequest(
                        request.id,
                        true
                      );

                      if (response.error) {
                        toast.error(response.error);
                      } else if (response.message) {
                        toast(response.message);
                      }

                      setLoading(false);
                    }}
                    disabled={loading}
                    color="green"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={async () => {
                      if (
                        !(rejectionReason && rejectionReason.trim().length > 0)
                      ) {
                        return toast.error(
                          "You must provide a rejection reason"
                        );
                      }

                      setLoading(true);

                      const response = await updatePayoutRequest(
                        request.id,
                        false,
                        rejectionReason
                      );

                      if (response.error) {
                        toast.error(response.error);
                      } else if (response.message) {
                        toast(response.message);
                      }

                      setLoading(false);
                    }}
                    disabled={loading}
                    color="red"
                  >
                    Reject
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PayoutRequestsTable;
