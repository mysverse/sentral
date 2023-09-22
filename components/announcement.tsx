"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useCallback, useEffect, useState } from "react";

const key = "announcement_blog_0";

export default function AnnouncementBanner() {
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

  if (hidden) return null;

  return (
    <div className="flex items-center gap-x-6 bg-slate-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm leading-6 text-white">
        <a
          href="https://blog.yan3321.com/myx-labs-q3-2022-update/"
          target="_blank"
        >
          <strong className="font-semibold">MYX Labs Year 1 Update</strong>
          <svg
            viewBox="0 0 2 2"
            className="mx-2 inline h-0.5 w-0.5 fill-current"
            aria-hidden="true"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          Look back on what we achieved in 2022, and plans for beyond&nbsp;
          <span aria-hidden="true">&rarr;</span>
        </a>
      </p>
      <div className="flex flex-1 justify-end">
        <button
          type="button"
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
          onClick={savePrivacyShown}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
