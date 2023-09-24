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
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => {}}
        initialFocus={buttonRef}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
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
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
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
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CurrencyDollarIcon
                    className="h-6 w-6 text-green-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {`You're using`} 100% free donationware
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {`Hey! I'm Yan, the developer and maintainer of MYX Labs.`}{" "}
                      You may have noticed some upgrades all around.
                    </p>
                    <p className="mt-3 text-sm text-gray-500">
                      I have recently discovered that hosting this project is
                      taking a sizable burden on my personal finances, more than
                      I originally anticipated.
                    </p>
                    <p className="mt-3 text-sm text-gray-500">
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
                    <p className="mt-3 text-sm text-gray-500">
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
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-slate-800 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:bg-slate-200 sm:text-sm"
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
