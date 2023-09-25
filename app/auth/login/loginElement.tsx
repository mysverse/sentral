"use client";

import { Transition } from "@headlessui/react";
import SignInButton from "components/signIn";
// import DefaultTransitionLayout from "components/transition";

import Link from "next/link";

import Logo from "public/img/MYSverse_Sentral_Logo.svg";
import { useEffect, useState } from "react";

export default function LoginElement({
  imageLoaded
}: {
  imageLoaded: boolean;
}) {
  const [show, setShow] = useState<boolean>(false);
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  useEffect(() => {
    if (imageLoaded) {
      setShow(true);
    }
  }, [imageLoaded]);
  return (
    <div className="relative flex h-full items-center justify-center">
      <Transition
        show={authenticating}
        enter="transition duration-[500ms] delay-200"
        enterFrom="opacity-0 scale-50"
        enterTo="opacity-100 scale-100"
        className="absolute"
      >
        <p className="text-xl font-medium leading-6 text-white">
          Redirecting to Roblox...
        </p>
      </Transition>

      <Transition
        show={show}
        enter="transform transition duration-[500ms] delay-75"
        enterFrom="opacity-0 -translate-y-36 scale-80"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transform transition duration-[750ms]"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 -translate-y-36 scale-80"
      >
        <div>
          <Logo className="h-20 w-auto fill-white" />
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
            Welcome to Sentral (Beta)
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            The official companion web app for{" "}
            <Link
              href="https://mysver.se/"
              className="font-semibold text-gray-100 underline hover:text-gray-200 hover:no-underline"
            >
              MYSverse
            </Link>{" "}
            and MYSverse Sim.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            This site uses the Roblox Open Cloud and OAuth 2.0 APIs for data
            fetching and authentication, which are still in beta.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            {"Don't have a Roblox account? "}
            <Link
              href="https://www.roblox.com/"
              className="font-semibold text-gray-100 underline hover:text-gray-200 hover:no-underline"
            >
              Sign up here!
            </Link>
          </p>
        </div>
        <div className="mt-10">
          <div
            onClick={() => {
              setShow(false);
              setAuthenticating(true);
            }}
            className="mt-6 grid grid-cols-1 gap-4"
          >
            <SignInButton />
          </div>
        </div>

        <p className="mt-10 text-sm leading-6 text-gray-300">
          {"Read our "}
          <Link
            href="/privacy-policy"
            className="font-medium text-gray-200 underline hover:text-gray-300 hover:no-underline"
          >
            privacy policy
          </Link>
          {" and "}
          <Link
            href="/terms-of-service"
            className="font-medium text-gray-200 underline hover:text-gray-300 hover:no-underline"
          >
            terms of service
          </Link>
        </p>
      </Transition>
    </div>
  );
}
