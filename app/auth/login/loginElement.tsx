"use client";

import SignInButton from "components/signIn";
import DefaultTransitionLayout from "components/transition";

import Link from "next/link";

import Logo from "public/img/MYSverse_Sentral_Logo.svg";
import { useEffect, useState } from "react";

export default function LoginElement() {
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    setShow(true);
  }, []);
  return (
    <DefaultTransitionLayout show={show} appear={false}>
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
        <div className="mt-10">
          <div
            onClick={() => setShow(false)}
            className="mt-6 grid grid-cols-1 gap-4"
          >
            <SignInButton />
          </div>
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
    </DefaultTransitionLayout>
  );
}
