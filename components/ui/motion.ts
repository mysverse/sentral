import type { Transition, TargetAndTransition } from "motion/react";

// Single source of animation truth. Pages enter via PageTransition
// (AnimateView); in-page reveals spread these presets onto motion elements.

export const springPage: Transition = {
  type: "spring",
  visualDuration: 0.35,
  bounce: 0.1
};

export const springUI: Transition = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.15
};

export const fadeFast: Transition = { duration: 0.15, ease: "easeIn" };

// AnimateView targets — transform strings stay on the WAAPI fast path
export const pageEnter: TargetAndTransition = {
  opacity: [0, 1],
  transform: ["translateY(12px)", "translateY(0px)"]
};

export const pageExit: TargetAndTransition = {
  opacity: 0,
  transition: fadeFast
};

// Spread presets for motion.div etc.
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.25, ease: "easeOut" }
} as const;

export const enterUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: springUI
} as const;

export const inViewUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: springUI
} as const;

export const STAGGER = 0.05;
