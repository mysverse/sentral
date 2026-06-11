"use client";

import { SWRConfig } from "swr";
import { defaultSwrOptions } from "components/swr";

export default function SwrProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return <SWRConfig value={defaultSwrOptions}>{children}</SWRConfig>;
}
