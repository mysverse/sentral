"use client"; // Error components must be Client Components

import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { motion } from "motion/react";
import { Button } from "components/catalyst/button";
import { enterUp } from "components/ui/motion";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <motion.div {...enterUp}>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-lg px-5 py-6 shadow-sm sm:px-6">
          <div className="flex min-h-64 flex-col items-center justify-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <ExclamationCircleIcon
                className="size-10 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="mt-6 max-w-md text-center">
              <h3 className="text-strong text-lg leading-6 font-semibold">
                Something went wrong
              </h3>
              <p className="text-muted mt-2 text-sm">
                We could not load this page. Please try again — if the problem
                keeps happening, contact support.
              </p>
              <div className="mt-6">
                <Button onClick={reset}>Try again</Button>
              </div>
              {error.digest && (
                <p className="text-muted mt-4 text-xs">
                  Reference ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
