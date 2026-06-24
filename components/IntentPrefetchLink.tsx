"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { preload } from "swr";

const prefetchRead = async (key: string) => {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error(`Prefetch failed (${response.status})`);
  }
  const payload = (await response.json()) as {
    data?: unknown;
    fetchedAt?: string;
  };
  return "fetchedAt" in payload ? payload.data : payload;
};

type Props = React.ComponentProps<typeof Link> & {
  swrKeys?: string[];
};

export default function IntentPrefetchLink({
  swrKeys = [],
  onPointerEnter,
  onFocus,
  href,
  ...props
}: Props) {
  const router = useRouter();
  const prefetch = () => {
    if (typeof href === "string") {
      router.prefetch(href);
    }
    swrKeys.forEach((key) => preload(key, prefetchRead));
  };

  return (
    <Link
      {...props}
      href={href}
      onPointerEnter={(event) => {
        prefetch();
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
    />
  );
}
