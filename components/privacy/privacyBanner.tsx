"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { Button } from "components/catalyst/button";
import { useCallback, useState } from "react";

const key = "privacy_tos_modal_0";

export default function PrivacyBanner() {
  const [privacyShown, setPrivacyShown] = useState<boolean | undefined>(() => {
    // Initialize state from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      return saved === key;
    }
    return undefined;
  });

  const savePrivacyShown = useCallback(() => {
    setPrivacyShown(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, key);
    }
  }, []);

  const hidden = privacyShown || typeof privacyShown === "undefined";

  return (
    <div
      className={clsx(
        hidden ? "hidden" : "",
        "pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-6"
      )}
    >
      <div className="bg-surface pointer-events-auto mx-auto max-w-2xl rounded-xl p-6 shadow-lg ring-1 ring-gray-900/10 dark:ring-white/10">
        <p className="text-strong text-sm leading-6">
          We collect and store data regarding your usage to improve our services
          and prevent abuse.
          <br />
          By continuing to use our service, you agree to our{" "}
          <Link
            href="/privacy-policy"
            onClick={savePrivacyShown}
            className="text-primary-600 dark:text-primary-400 font-semibold underline hover:no-underline"
          >
            privacy policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms-of-service"
            onClick={savePrivacyShown}
            className="text-primary-600 dark:text-primary-400 font-semibold underline hover:no-underline"
          >
            terms of service
          </Link>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <Button onClick={savePrivacyShown} className="px-8">
            Agree and continue
          </Button>
        </div>
      </div>
    </div>
  );
}
