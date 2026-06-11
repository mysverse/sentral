"use client";

import { AnimateView } from "motion-plus/animate-view";
import { springPage, pageEnter, pageExit } from "components/ui/motion";

// Rendered by each route group's template.tsx: templates remount per
// navigation, which is exactly the enter/exit trigger AnimateView needs.
// Loading.tsx fallback -> page swaps animate as ViewTransition updates.
// Browsers without the View Transitions API get an instant swap.
export default function PageTransition({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimateView transition={springPage} enter={pageEnter} exit={pageExit}>
      {children}
    </AnimateView>
  );
}
