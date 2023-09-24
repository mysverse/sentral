"use client";

import { signIn } from "next-auth/react";
import RobloxIcon from "public/img/Roblox_Logo.svg";

function SignInButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signIn("roblox", {
          redirect: true,
          callbackUrl: "/"
        })
      }
      className="inline-flex items-center justify-center gap-x-1.5 rounded-md outline outline-gray-200 outline-1 px-2.5 py-2.5 text-sm font-semibold bg-blue-700 text-white shadow-md shadow-gray-200/10 hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <RobloxIcon className="mx-2 h-5 w-5 fill-white" aria-hidden="true" />
      Sign in with Roblox
    </button>
  );
}

export default SignInButton;
