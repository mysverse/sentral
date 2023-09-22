/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";

import QueryModalContent from "./mecs/mecsModalContent";

import { useUserData } from "./swr";
import version from "./version";

export default function QueryModal({
  username,
  open,
  setModalOpen
}: {
  username: string;
  open: boolean;
  setModalOpen: any;
}) {
  const handleModalClosure = useCallback(
    (event: any) => {
      setModalOpen(event);
    },
    [setModalOpen]
  );

  const shouldFetch = open && username.trim().length > 0;

  const { apiResponse, isLoading, isError } = useUserData(
    username,
    shouldFetch
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleModalClosure}
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
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden w-1000 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <QueryModalContent
                  apiResponse={apiResponse}
                  loading={isLoading}
                  error={isError !== null}
                />

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
                  <div>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {
                        handleModalClosure(false);
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                  <div>
                    <p className="w-full inline-flex justify-center py-2 text-base font-light text-gray-500 uppercase sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                      MYX-MECS-{version}
                      {apiResponse ? `-${apiResponse.user.userId}` : null}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
