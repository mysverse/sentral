"use client"; // Error components must be Client Components

import { Transition } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Transition
      as="div"
      show={true}
      appear={true}
      enter="transform transition duration-400"
      enterFrom="opacity-0 -translate-y-36"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition duration-400"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-36"
    >
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="flex min-h-64 flex-col items-center justify-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <ExclamationCircleIcon
                className="size-10 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-6 max-w-md text-center">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We could not load this page. Please try again — if the problem
                keeps happening, contact support.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  onClick={reset}
                >
                  Try again
                </button>
              </div>
              {error.digest && (
                <p className="mt-4 text-xs text-gray-400">
                  Reference ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
