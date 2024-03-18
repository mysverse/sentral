"use client";

import { PayoutRequestData } from "components/apiTypes";
import { useEffect } from "react";

import { submitPayoutRequest } from "actions/submitPayout";
import { useFormState } from "react-dom";
import toast from "react-hot-toast";
import PayoutRequestsTable from "./PayoutRequestTable";

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
            min={"1"}
            max={"100"}
            placeholder="Maximum 100 R$ per request"
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
            placeholder={
              "Promotion from rank X to rank Y \nList of items:\n1. https://roblox.com/catalog/123456/shirt\n2. https://roblox.com/catalog/245678/pants\n..."
            }
            name="reason"
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <div className="flex flex-row">
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Request
          </button>
        </div>
      </form>
      <h2 className="mb-4 text-lg font-medium">Payout Requests</h2>
      <PayoutRequestsTable payoutRequests={payoutRequests} />
    </div>
  );
}

export default PayoutRequestComponent;
