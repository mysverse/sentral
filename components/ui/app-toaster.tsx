"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";
import { publicSans } from "styles/fonts";

export default function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{ className: publicSans.className }}
    />
  );
}
