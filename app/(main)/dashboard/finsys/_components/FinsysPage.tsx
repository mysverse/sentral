"use client";

import { PayoutRequestData } from "components/apiTypes";
import React, { useEffect } from "react";

import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { submitPayoutRequest } from "actions/submitPayout";
import { useFormState } from "react-dom";
import toast from "react-hot-toast";

const statuses: { [key: string]: string } = {
  pending: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  approved: "text-green-700 bg-green-50 ring-green-600/20",
  rejected: "text-red-700 bg-red-50 ring-red-600/20"
};

function PayoutRequestsTable({
  payoutRequests
}: {
  payoutRequests: PayoutRequestData[];
}) {
  // Icon selection based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return ArrowUpCircleIcon;
      case "rejected":
        return ArrowPathIcon;
      default:
        return ArrowDownCircleIcon;
    }
  };

  return (
    <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
              Amount (R$)
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {payoutRequests.map((request, idx) => (
            <tr
              key={request.id}
              className={clsx(
                idx === 0 ? "" : "border-t border-gray-200",
                "relative py-4 pl-4 pr-3 sm:pl-6"
              )}
            >
              <td>
                <div className="flex items-center gap-x-6 py-3 pl-3">
                  {React.createElement(getStatusIcon(request.status), {
                    className: "h-6 w-6 text-gray-500",
                    "aria-hidden": "true"
                  })}
                  <span className="text-sm text-gray-900">
                    {request.amount}
                  </span>
                </div>
              </td>
              <td className="text-sm text-gray-500">
                <span
                  className={clsx(
                    "rounded-md px-2 py-1 font-medium ring-1 ring-inset",
                    statuses[request.status]
                  )}
                >
                  {request.status}
                </span>
              </td>
              <td className="text-sm text-gray-500">{request.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const initialState = {
  message: ""
};

function PayoutRequestComponent({
  payoutRequests
}: {
  payoutRequests: PayoutRequestData[];
}) {
  const [state, formAction] = useFormState(submitPayoutRequest, initialState);
  useEffect(() => {
    // const message = state.message;
    const error = state.error;
    if (error) {
      toast.error(error);
    }
  }, [state]);
  return (
    <div className="container mx-auto p-2">
      <h2 className="mb-4 text-lg font-medium">Submit a Payout Request</h2>
      <form action={formAction} className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Request
        </button>
      </form>
      <h2 className="mb-4 text-lg font-medium">Payout Requests</h2>
      <PayoutRequestsTable payoutRequests={payoutRequests} />
    </div>
  );
}

export default PayoutRequestComponent;
