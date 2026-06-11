"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { springUI } from "components/ui/motion";

const order = ["system", "light", "dark"] as const;

const emptySubscribe = () => () => {};

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // Theme is only known client-side; render a stable placeholder until hydrated
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const current = (theme ?? "system") as (typeof order)[number];
  const next = order[(order.indexOf(current) + 1) % order.length];

  const icon = !mounted ? (
    <span className="block size-5" />
  ) : current === "system" ? (
    <ComputerDesktopIcon className="size-5" />
  ) : resolvedTheme === "dark" ? (
    <MoonIcon className="size-5" />
  ) : (
    <SunIcon className="size-5" />
  );

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      title={mounted ? `Theme: ${current} (click for ${next})` : "Theme"}
      aria-label="Toggle colour theme"
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? current + (resolvedTheme ?? "") : "placeholder"}
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
          transition={springUI}
          className="block"
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
