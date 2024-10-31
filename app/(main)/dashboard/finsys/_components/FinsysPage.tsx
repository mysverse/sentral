"use client";

import { useEffect, useState } from "react";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { submitPayoutRequest } from "actions/submitPayout";
import { useFormState, useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import Link from "next/link";

const initialState = {
  message: ""
};

function FinsysInfo() {
  return (
    <div className="my-4 rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Important information on 14-day minimum waiting period for payouts
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Due to Roblox security policies, your account must be in the
              FinSys Roblox group for at least 14 days before a payout can be
              successfully processed. Please refer to the{" "}
              <Link
                href="https://dev.mysver.se/finsys-usage-guide/"
                target="_blank"
                className="font-bold underline hover:no-underline"
              >
                usage guide
              </Link>{" "}
              for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist() {
  return (
    <fieldset>
      <legend className="sr-only">Pre-submission checklist</legend>
      <div className="space-y-5">
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="confirmation_amount"
              name="confirmation_amount"
              type="checkbox"
              aria-describedby="confirmation_amount_description"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_amount"
              className="font-medium text-gray-900"
            >
              Amount
            </label>
            <p id="confirmation_amount_description" className="text-gray-500">
              I have requested the correct amount of R$ based on the list of
              items I intend to purchase and not more. If I am requesting less
              than total value of the items, I do not intend to be reimbursed in
              the future.
            </p>
          </div>
        </div>
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="confirmation_reason"
              name="confirmation_reason"
              type="checkbox"
              aria-describedby="confirmation_reason-description"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_reason"
              className="font-medium text-gray-900"
            >
              Reason
            </label>
            <p id="confirmation_reason-description" className="text-gray-500">
              I have provided a valid reason for making a payout request. I am
              making this request as a necessity to participate in MYSverse Sim
              activities and not for personal reasons.
            </p>
          </div>
        </div>
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="confirmation_itemlist"
              name="confirmation_itemlist"
              type="checkbox"
              aria-describedby="confirmation_itemlist-description"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_itemlist"
              className="font-medium text-gray-900"
            >
              Item list
            </label>
            <p id="confirmation_itemlist-description" className="text-gray-500">
              I have provided the complete list of items I intend to purchase
              with the provided funds. These items are owned by a MYSverse
              quartermaster store or an approved quartermaster.
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function PayoutRequestComponent() {
  const [state, formAction] = useFormState(submitPayoutRequest, initialState);
  const { pending } = useFormStatus();
  const [category, setCategory] = useState<string>();
  useEffect(() => {
    // const message = state.message;
    const error = state.error;
    if (error) {
      toast.error(error);
    }
  }, [state]);
  return (
    <div className="container mx-auto p-2">
      <h2 className="text-lg font-medium">Submit a Payout Request</h2>
      <FinsysInfo />
      <div className="my-4 rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              aria-hidden="true"
              className="h-5 w-5 text-yellow-400"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              No payouts for non-quartermaster catalog items
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                We will only process payouts for uniform items that are owned
                either by a MYSverse quartermaster Roblox group, or the
                quartermaster&apos;s personal Roblox account. This is to ensure
                adequate funding and support for MYSverse Sim. Please contact
                your Sim agency leadership if you have any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <form action={formAction} className="mb-6">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
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
          <div>
            <label
              htmlFor="sim_agency"
              className="block text-sm font-medium text-gray-700"
            >
              Agency
            </label>
            <select
              id="sim_agency"
              name="sim_agency"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option disabled selected value="">
                Select a Sim agency
              </option>
              <option>Tentera MYSverse - Army</option>
              <option>Tentera MYSverse - Air Force</option>
              <option>Tentera MYSverse - Navy</option>
              <option>Polis MYSverse</option>
              <option>Bomba MYSverse</option>
              <option>Kesihatan MYSverse</option>
              <option>Parlimen MYSverse</option>
              <option>Other MYSverse Sim agency</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="sim_reason"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="sim_reason"
            name="sim_reason"
            required
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option disabled selected value="">
              Select a request category
            </option>
            <option value="Recruited">New recruit</option>
            <option value="Promotion">
              Promotion (please state old and new rank)
            </option>
            <option value="Demotion">
              Demotion (please state old and new rank)
            </option>
            <option value="Transfer/External">
              Transferred from other Sim agency (please state old agency)
            </option>
            <option value="Transfer/Internal">
              Change of internal division/department (please state new
              division/department)
            </option>
            <option value="Update">New or updated uniform requirements</option>
            <option value="Other">Other (please state)</option>
          </select>
        </div>
        {(category === "Promotion" || category === "Demotion") && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sim_rank_previous"
                className="block text-sm font-medium text-gray-700"
              >
                Previous rank
              </label>
              <input
                type="text"
                id="sim_rank_previous"
                name="sim_rank_previous"
                placeholder="Private"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sim_rank_after"
                className="block text-sm font-medium text-gray-700"
              >
                New rank
              </label>
              <input
                type="text"
                id="sim_rank_after"
                name="sim_rank_after"
                placeholder="Corporal"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        )}
        {(category === "Transfer/Internal" ||
          category === "Transfer/External") && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sim_transfer_previous"
                className="block text-sm font-medium text-gray-700"
              >
                Previous agency/division
              </label>
              <input
                type="text"
                id="sim_transfer_previous"
                name="sim_transfer_previous"
                placeholder="Agency/Division Alpha"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sim_transfer_after"
                className="block text-sm font-medium text-gray-700"
              >
                New agency/division
              </label>
              <input
                type="text"
                id="sim_transfer_after"
                name="sim_transfer_after"
                placeholder="Agency/Division Bravo"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        )}
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
            maxLength={4096}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <Checklist />
        <div className="mt-4 text-sm leading-6 text-gray-500">
          By submitting a request, I have verified the above factors are
          correct, and understand it may be <b>rejected</b> if I do not follow
          the clearly listed instructions. I recognise that payouts are a
          privilege, and I may be <b>blacklisted</b> if I abuse them subject to
          the terms and conditions of Sentral, MYSverse and MYSverse Sim.
        </div>
        <div className="mt-4 flex flex-row">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </form>
      <h2 className="mb-4 text-lg font-medium">Payout Requests</h2>
    </div>
  );
}

export default PayoutRequestComponent;
