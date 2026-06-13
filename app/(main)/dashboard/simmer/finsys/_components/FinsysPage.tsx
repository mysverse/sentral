"use client";

import {
  JSX,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState
} from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Button } from "components/catalyst/button";
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
        type === "urgent"
          ? "bg-red-50 dark:bg-red-950"
          : "bg-yellow-50 dark:bg-yellow-950"
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          {type === "urgent" ? (
            <ExclamationTriangleIcon
              className="h-5 w-5 text-red-400 dark:text-red-500"
              aria-hidden="true"
            />
          ) : (
            <ExclamationTriangleIcon
              className="h-5 w-5 text-yellow-400 dark:text-yellow-500"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="ml-3">
          <h3
            className={clsx(
              "text-sm font-medium",
              type === "urgent"
                ? "text-red-800 dark:text-red-300"
                : "text-yellow-800 dark:text-yellow-300"
            )}
          >
            {title}
          </h3>
          <div
            className={clsx(
              "mt-2 text-sm",
              type === "urgent"
                ? "text-red-700 dark:text-red-400"
                : "text-yellow-700 dark:text-yellow-400"
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
              className="border-edge text-primary-600 h-4 w-4 rounded-sm focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_amount"
              className="text-strong font-medium"
            >
              Amount
            </label>
            <p id="confirmation_amount_description" className="text-muted">
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
              className="border-edge text-primary-600 h-4 w-4 rounded-sm focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_reason"
              className="text-strong font-medium"
            >
              Reason
            </label>
            <p id="confirmation_reason-description" className="text-muted">
              I have provided a valid reason for making a payout request. I am
              making this request as a necessity to participate in MYSverse Sim
              activities and not for personal reasons. The reason I am making
              this request is accurate to the category I have selected above.
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
              className="border-edge text-primary-600 h-4 w-4 rounded-sm focus:ring-blue-600"
              required
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label
              htmlFor="confirmation_itemlist"
              className="text-strong font-medium"
            >
              Item list
            </label>
            <p id="confirmation_itemlist-description" className="text-muted">
              I have provided the complete list of items I intend to purchase
              with the provided funds. These items are owned by a MYSverse
              quartermaster store and are not available in the in-game equipment
              module. I am unable to afford all of the listed items.
            </p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

const agencies = allowedGroups;

type Content = string | JSX.Element;

function PayoutRequestComponent({ groups }: { groups: RbxGroupData[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitPayoutRequest,
    initialState
  );
  const [category, setCategory] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [reason, setReason] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalReasons, setModalReasons] = useState<Content[]>([]);

  useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reasons: Content[] = [];

    // Extract Roblox links from the reason
    const ids = extractRobloxIDs(reason);
    const expectedAmount = ids.length * 5;

    if (expectedAmount !== amount) {
      reasons.push(
        <>
          The total estimated amount calculated from your Roblox item links does
          not match the amount you entered.
          <br />
          Expected amount: {ids.length} x 5 R$ = <b>{expectedAmount} R$.</b>
          <br />
          Entered amount: {amount} R$.
        </>
      );
    }

    if (category === "Missing") {
      reasons.push(
        <>
          Make sure that the items you are requesting funds for do not already
          exist in the in-game equipment module. Misuse of this category may
          result in <b>blacklists</b>.
        </>
      );
    }

    if (reasons.length > 0) {
      setModalReasons(reasons);
      setShowModal(true);
    } else {
      submit();
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
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
              As of 15 April 2025, payouts are only provided for visits to
              non-MYSverse experiences such as foreign Ro-Nation visits. If you
              need a uniform within a MYSverse experience that is not available
              in the in-game equipment module, please contact your Sim agency
              leadership to request the uniform to be added to the in-game
              equipment module.
            </>
          }
        />
      </div>
      <form id="payout-form" onSubmit={handleSubmit} ref={formRef}>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="amount"
              className="text-strong block text-sm font-medium"
            >
              Amount
            </label>
            <Slider name={"amount"} min={1} max={100} onChange={setAmount} />
          </div>
          <div>
            <label
              htmlFor="sim_agency"
              className="text-strong block text-sm font-medium"
            >
              Agency
            </label>
            <select
              id="sim_agency"
              name="sim_agency"
              required
              defaultValue=""
              className="border-edge bg-surface text-strong mt-1 block w-full rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="text-strong block text-sm font-medium"
          >
            Category
          </label>
          <select
            id="sim_reason"
            name="sim_reason"
            required
            onChange={(e) => setCategory(e.target.value)}
            defaultValue=""
            className="border-edge bg-surface text-strong mt-1 block w-full rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option disabled value="">
              Select a request category
            </option>
            <option value="Visit/Foreign">Visit to foreign Ro-Nation</option>
            <option value="Visit/Other">
              Visit to other non-MYSverse experience
            </option>
            {/* <option value="Missing">
              Uniform not in in-game equipment module
            </option> */}
          </select>
        </div>
        {(category === "Visit/Foreign" || category === "Visit/Other") && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="visit_link"
                className="text-strong block text-sm font-medium"
              >
                Roblox Experience/Group Link (
                {category === "Visit/Foreign"
                  ? "Foreign Ro-Nation"
                  : "Non-MYSverse"}
                )
              </label>
              <input
                type="url"
                id="visit_link"
                name="visit_link"
                placeholder="https://roblox.com/games/123456789/Example"
                className="border-edge bg-surface text-strong placeholder:text-muted mt-1 block w-full rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="visit_date"
                className="text-strong block text-sm font-medium"
              >
                Visit Date
              </label>
              <input
                type="date"
                id="visit_date"
                name="visit_date"
                className="border-edge bg-surface text-strong mt-1 block w-full rounded-md [color-scheme:light_dark] shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                min={new Date().toISOString().split("T")[0]} // Restrict past dates
              />
            </div>
          </div>
        )}
        {/* {(category === "Promotion" || category === "Demotion") && (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sim_rank_previous"
                className="block text-sm font-medium text-strong"
              >
                Previous rank
              </label>
              <input
                type="text"
                id="sim_rank_previous"
                name="sim_rank_previous"
                placeholder="Private"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-edge shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sim_rank_after"
                className="block text-sm font-medium text-strong"
              >
                New rank
              </label>
              <input
                type="text"
                id="sim_rank_after"
                name="sim_rank_after"
                placeholder="Corporal"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-edge shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                className="block text-sm font-medium text-strong"
              >
                Previous agency/division
              </label>
              <input
                type="text"
                id="sim_transfer_previous"
                name="sim_transfer_previous"
                placeholder="Agency/Division Alpha"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-edge shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="sim_transfer_after"
                className="block text-sm font-medium text-strong"
              >
                New agency/division
              </label>
              <input
                type="text"
                id="sim_transfer_after"
                name="sim_transfer_after"
                placeholder="Agency/Division Bravo"
                maxLength={64}
                className="mt-1 block w-full rounded-md border-edge shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        )}
        */}
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="text-strong block text-sm font-medium"
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
            className="border-edge bg-surface text-strong placeholder:text-muted mt-1 block w-full rounded-md shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onChange={(e) => setReason(e.target.value)}
            required
          ></textarea>
        </div>
        <Checklist />
        <div className="text-muted mt-4 text-sm leading-6">
          By submitting a request, I have verified the above factors are
          correct, and understand it may be <b>rejected</b> if I do not follow
          the clearly listed instructions. I recognise that payouts are a
          privilege, and I may be <b>blacklisted</b> if I abuse them subject to
          the terms and conditions of Sentral, MYSverse and MYSverse Sim.
        </div>
        <div className="mt-4 flex flex-row">
          <Button type="submit" disabled={pending}>
            Submit Request
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {
        <div
          className={clsx(
            "fixed inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur transition-opacity duration-300 ease-in-out",
            {
              "pointer-events-none opacity-0": !showModal,
              "opacity-100": showModal
            }
          )}
        >
          <div
            className={clsx(
              "bg-surface max-w-sm transform rounded-lg p-6 shadow-lg transition-transform duration-300 ease-in-out",
              { "scale-95": !showModal, "scale-100": showModal }
            )}
          >
            <h2 className="text-strong mb-4 text-lg font-semibold">
              Are you sure you want to submit?
            </h2>
            {modalReasons.map((reason, index) => (
              <p key={index} className="text-muted mb-4">
                {reason}
              </p>
            ))}
            <p className="text-muted mb-4 text-sm">
              Your payout privileges may be <b>revoked</b> if you fail to double
              check your request and waste the approval team&apos;s review time.
            </p>
            <div className="flex justify-end space-x-4">
              <Button outline onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Yes, Submit</Button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default PayoutRequestComponent;
