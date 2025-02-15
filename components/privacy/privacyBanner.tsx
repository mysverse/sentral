"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const key = "privacy_tos_modal_0";

export default function PrivacyBanner() {
  const [privacyShown, setPrivacyShown] = useState<boolean | undefined>();

  const savePrivacyShown = useCallback(() => {
    setPrivacyShown(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, key);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved === key) {
      setPrivacyShown(true);
    } else {
      setPrivacyShown(false);
    }
  }, []);

  useEffect(() => {
    if (privacyShown) {
      localStorage.setItem(key, key);
    }
  }, [privacyShown]);

  const hidden = privacyShown || typeof privacyShown === "undefined";

  return (
    <div
      className={clsx(
        hidden ? "hidden" : "",
        "pointer-events-none fixed inset-x-0 bottom-0 z-10 px-6 pb-6"
      )}
    >
      <div className="pointer-events-auto mx-auto max-w-2xl rounded-xl bg-white p-6 ring-1 shadow-lg ring-gray-900/10">
        <p className="text-sm leading-6 text-gray-900">
          We collect and store data regarding your usage to improve our services
          and prevent abuse.
          <br />
          By continuing to use our service, you agree to our{" "}
          <Link
            href="/privacy-policy"
            onClick={savePrivacyShown}
            className="font-semibold text-blue-600 underline hover:no-underline"
          >
            privacy policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms-of-service"
            onClick={savePrivacyShown}
            className="font-semibold text-blue-600 underline hover:no-underline"
          >
            terms of service
          </Link>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            type="button"
            onClick={savePrivacyShown}
            className="rounded-md bg-blue-600 px-8 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Agree and continue
          </button>
        </div>
      </div>
    </div>
  );
}
