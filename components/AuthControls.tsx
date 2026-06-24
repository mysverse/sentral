"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function AuthControls() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <div className="h-8 w-8" aria-hidden="true" />;
  }
  if (isSignedIn) {
    return <UserButton />;
  }
  return (
    <SignInButton>
      <button className="rounded-sm px-2 py-1 text-white outline outline-white transition hover:bg-white hover:text-blue-500">
        Sign in
      </button>
    </SignInButton>
  );
}
