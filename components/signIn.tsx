"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import RobloxIcon from "public/img/Roblox_Logo.svg";

function SignInButton() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  if (session) {
    return (
      <button
        type="button"
        onClick={() => signOut()}
        className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-red-700 px-2.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-gray-200/10 outline outline-1 outline-gray-200 hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <RobloxIcon className="mx-2 h-5 w-5 fill-white" aria-hidden="true" />
        Sign out
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() =>
        signIn("roblox", {
          callbackUrl: callbackUrl ? decodeURIComponent(callbackUrl) : undefined
        })
      }
      className="group inline-flex items-center justify-center gap-x-1.5 rounded-md bg-blue-700 px-2.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-gray-200/10 outline outline-1 outline-gray-200 transition hover:bg-white hover:text-blue-700 hover:outline-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <RobloxIcon
        className="mx-2 h-5 w-5 fill-white transition group-hover:fill-blue-700"
        aria-hidden="true"
      />
      Sign in with Roblox
    </button>
  );
}

export default SignInButton;
