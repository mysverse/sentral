"use client";

import { Transition } from "@headlessui/react";
import { ReactNode } from "react";

export default function DefaultTransitionLayout({
  show,
  appear,
  children
}: {
  show: boolean;
  appear: boolean;
  children: ReactNode;
}) {
  return (
    <Transition
      //   as={Fragment}
      show={show}
      appear={appear}
      enter={`transform transition duration-[400ms]`}
      enterFrom="opacity-0 -translate-y-36 scale-80"
      enterTo="opacity-100 translate-y-0 scale-100"
    >
      {children}
    </Transition>
  );
}
