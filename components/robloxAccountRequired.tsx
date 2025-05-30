"use client";

import { XCircleIcon } from "@heroicons/react/20/solid";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle
} from "@headlessui/react";

export default function RobloxAccountRequired() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:data-closed:translate-y-0 sm:data-closed:scale-95"
          >
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
                <XCircleIcon
                  aria-hidden="true"
                  className="size-6 text-red-600"
                />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  Linked Roblox account required
                </DialogTitle>
                <div className="mt-2 flex flex-col space-y-2 text-sm text-gray-500">
                  <p>
                    You must have a linked Roblox account to access this page.
                  </p>
                  <p>
                    {`Add one through "Manage Account", accessible through the
                    user button below.`}
                  </p>
                  <p className="text-xs">
                    {`Profile - Connected accounts - Connect account - Roblox`}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-col items-center sm:mt-6">
              <UserButton />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
