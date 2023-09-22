"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { isStandalonePWA } from "./utils";

const key = "donate_modal_0";

export default function DonateModal() {
  const [open, setOpen] = useState(true);
  let buttonRef = useRef(null);

  const [donateShown, setDonateShown] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved === key) {
        return true;
      }
    }
    return false;
  });

  const saveDonateShown = () => {
    setDonateShown(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, key);
    }
  };

  return null;

  if (donateShown || isStandalonePWA()) {
    return null;
  }

  return (
    <Transition.Root show={open && !donateShown} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={() => {}}
        initialFocus={buttonRef}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CurrencyDollarIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {`You're using`} 100% free donationware
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {`Hey! I'm Yan, the developer and maintainer of MYX Labs.`}{" "}
                      You may have noticed some upgrades all around.
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      I have recently discovered that hosting this project is
                      taking a sizable burden on my personal finances, more than
                      I originally anticipated.
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      If you are able, I implore you to seriously consider
                      pitching in. You may visit the{" "}
                      <a
                        href="https://opencollective.com/myxlabs"
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:no-underline"
                      >
                        MYX Labs Open Collective
                      </a>{" "}
                      to see the current state of funding.
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      With any luck, this will be the only time you see a
                      message like this.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <a
                  href="https://blog.yan3321.com/donate"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:text-sm disabled:bg-slate-200"
                    onClick={() => {
                      saveDonateShown();
                      setOpen(false);
                    }}
                    ref={buttonRef}
                  >
                    {`I'll do what I can, see donation options`}
                  </button>
                </a>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
