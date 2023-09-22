"use client";

import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="inline-flex items-center gap-x-1.5 rounded-md bg-red-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      Sign out
    </button>
  );
}

export default SignOutButton;
