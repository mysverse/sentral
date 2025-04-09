"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState
} from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { submitPayoutRequest } from "actions/submitPayout";
import { toast } from "sonner";
import Link from "next/link";
import clsx from "clsx";
import { extractRobloxIDs } from "utils/roblox";
import Slider from "components/Slider";
import { RbxGroupData } from "utils/sim";
import { allowedGroups } from "data/sim";
import Markdown from "react-markdown";

const initialState = {
  message: ""
};

function Notice({
  title,
  content,
  type
}: {
  title: React.ReactNode;
  content: React.ReactNode;
  type?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-md p-4",
        type === "urgent" ? "bg-red-50" : "bg-yellow-50"
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          {type === "urgent" ? (
            <ExclamationTriangleIcon
              className="h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          ) : (
            <ExclamationTriangleIcon
              className="h-5 w-5 text-yellow-400"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="ml-3">
          <h3
            className={clsx(
              "text-sm font-medium",
              type === "urgent" ? "text-red-800" : "text-yellow-800"
            )}
          >
            {title}
          </h3>
          <div
            className={clsx(
              "mt-2 text-sm",
              type === "urgent" ? "text-red-700" : "text-yellow-700"
            )}
          >
            <p>{content}</p>
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
              className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-600"
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
              className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-600"
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
              className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-600"
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
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="confirmation_eqpmodule"
              name="confirmation_eqpmodule"
              type="checkbox"
              aria-describedby="confirmation_eqpmodule-description"
              className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_eqpmodule"
              className="font-medium text-gray-900"
            >
              Equipment module
            </label>
            <p
              id="confirmation_eqpmodule-description"
              className="text-gray-500"
            >
              I have checked that the items I am requesting are not available in
              the in-game equipment module. If they are, I am requesting them on
              the basis of necessity such as outside MYSverse experiences like
              overseas Ro-Nation visits.
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

const agencies = allowedGroups;

function PayoutRequestComponent({ groups }: { groups: RbxGroupData[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitPayoutRequest,
    initialState
  );
  // const [agency, setAgency] = useState<string>();
  const [category, setCategory] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [reason, setReason] = useState<string>("");

  // New state variables
  const [showModal, setShowModal] = useState<boolean>(false);
  // const [override, setOverride] = useState<boolean>(false);

  useEffect(() => {
    // const message = state.message;
    const validationErrors = state.validationErrors;
    const error = state.error;
    if (validationErrors) {
      validationErrors.forEach((error) => {
        toast.error(<Markdown>{error}</Markdown>, {
          closeButton: true,
          position: "bottom-center",
          duration: 20 * 1000
        });
      });
    } else if (error) {
      toast.error(<Markdown>{error}</Markdown>);
    }
  }, [state]);

  const submit = () => {
    const form = formRef.current;
    if (form) {
      const formData = new FormData(form);
      startTransition(() => {
        formAction(formData);
      });
    }
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Extract Roblox links from the reason
    const ids = extractRobloxIDs(reason);
    const expectedAmount = ids.length * 5;

    if (expectedAmount !== amount) {
      // Show confirmation modal
      setShowModal(true);
    } else {
      submit();
    }
  };

  // Function to proceed after confirmation
  const handleConfirm = () => {
    setShowModal(false);
    // Submit the form
    submit();
  };

  return (
    <div className="p-1">
      <h2 className="text-lg font-medium">Submit a Payout Request</h2>
      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Notice
          title="Important information on 14-day minimum waiting period for payouts"
          content={
            <>
              Due to Roblox security policies, your account must be in the
              MYSverse Malaysian Community Roblox group for at least 14 days
              before a payout can be successfully processed. Please refer to the{" "}
              <Link
                href="https://dev.mysver.se/finsys-usage-guide/"
                target="_blank"
                className="font-bold underline hover:no-underline"
              >
                usage guide
              </Link>{" "}
              for more information.
            </>
          }
        />
        <Notice
          title="Do not request payouts for items available in equipment module"
          type="urgent"
          content={
            <>
              Funds will not be provided for items that are available in the
              in-game equipment module, unless absolutely necessary such as for
              usage in Roblox experiences outside of MYSverse (overseas visits,
              etc.). It is your responsibility to check that your requested
              items are available in the equipment module before submitting a
              payout request. Continued misuse will result in blacklists.
            </>
          }
        />
      </div>
      <form id="payout-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <Slider name={"amount"} min={1} max={100} onChange={setAmount} />
            {/* <input
              type="number"
              id="amount"
              name="amount"
              min={"1"}
              max={"100"}
              placeholder="Maximum 100 R$ per request"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onChange={(e) => setAmount(parseInt(e.target.value))}
              required
            /> */}
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
              // onChange={(e) => setAgency(e.target.value)}
              required
              defaultValue=""
              className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option disabled value="">
                Select a Sim agency
              </option>
              {agencies
                .filter((agency) =>
                  groups.find((group) => group.group.id === agency.id)
                )
                .map((agency) => (
                  <option key={agency.name} value={agency.name}>
                    {agency.name}
                  </option>
                ))}
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
            defaultValue=""
            className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option disabled value="">
              Select a request category
            </option>
            <option value="Recruited">New member/recruit</option>
            <option value="Promotion">Promotion</option>
            <option value="Demotion">Demotion</option>
            <option value="Transfer/External">
              Transferred from other Sim agency
            </option>
            <option value="Transfer/Internal">
              Change of internal division/department/regiment
            </option>
            <option value="Update">
              New or updated uniform requirements (please state)
            </option>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={(e) => setReason(e.target.value)}
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
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden disabled:opacity-50"
          >
            Submit Request
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="bg-opacity-50 fixed inset-0 z-10 flex items-center justify-center bg-black">
          <div className="max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Are you sure you want to submit?
            </h2>
            <p className="mb-4 text-gray-600">
              The total estimated amount calculated from your Roblox item links
              does not match the amount you entered.
            </p>
            <p className="mb-4 text-gray-600">
              Expected amount: {extractRobloxIDs(reason).length} x {5} R$ ={" "}
              <b>{extractRobloxIDs(reason).length * 5} R$</b>
            </p>
            <p className="mb-4 text-gray-600">
              Entered amount: <b>{amount} R$</b>
            </p>
            <p className="mb-4 text-gray-600">
              This is assuming each item costs 5 R$ each. Do you still want to
              proceed?
            </p>
            <p className="mb-4 text-sm text-gray-600">
              Your payout privileges may be <b>revoked</b> if you fail to double
              check your request and waste the approval team&apos;s review time.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayoutRequestComponent;
