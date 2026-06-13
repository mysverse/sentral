"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function LoginContent() {
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
