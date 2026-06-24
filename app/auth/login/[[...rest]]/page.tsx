"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Suspense } from "react";

function ThemedSignIn() {
  const { resolvedTheme } = useTheme();
  return (
    <SignIn
      appearance={{
        theme: resolvedTheme === "dark" ? dark : undefined,
        options: {
          logoPlacement: "none",
          termsPageUrl: "/terms-of-service",
          privacyPageUrl: "/privacy-policy"
        },
        variables: { colorPrimary: "rgb(59, 130, 246)" }
      }}
    />
  );
}

export default function LoginContent() {
  return (
    <Suspense fallback={<div className="h-[32rem] w-full max-w-sm" />}>
      <ThemedSignIn />
    </Suspense>
  );
}
