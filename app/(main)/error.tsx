"use client"; // Error components must be Client Components

import { Transition } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
// import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // useEffect(() => {
  //   // Log the error to an error reporting service
  //   console.error(error);
  // }, [error]);

  return (
    <Transition
      show={true}
      appear={true}
      enter="transform transition duration-[400ms]"
      enterFrom="opacity-0 -translate-y-36 scale-80"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transform transition duration-[400ms]"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 -translate-y-36 scale-80"
    >
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
          <div className="flex h-96 flex-col items-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <ExclamationCircleIcon
                className="h-12 w-12 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-center text-lg font-medium leading-6 text-gray-900">
                {"Uh oh, we couldn't complete that request..."}
              </h3>
              <div className="mt-4 text-center">
                <p className="font-mono text-lg font-bold uppercase">
                  Digest - {error.digest}
                </p>
                <p className="font-mono text-lg font-bold">{error.message}</p>
                <p className="mt-4 text-sm text-gray-500">
                  We suggest refreshing the page, clearing your browser cache,
                  or just trying again after some time.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  If the issue persists, please e-mail Yan, Lead Web Developer
                  at{" "}
                  <a
                    href="mailto:yan@mysver.se"
                    className="text-blue-500 underline"
                  >
                    yan@mysver.se
                  </a>{" "}
                  with the error message and digest number (if applicable).
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                  onClick={reset}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
