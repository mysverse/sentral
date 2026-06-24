"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import IntentPrefetchLink from "components/IntentPrefetchLink";
import { GENTAG_TEMPLATES_KEY } from "lib/readKeys";
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  logo?: any;
}

export default function FeatureCard({
  title,
  logo,
  description,
  href
}: FeatureCardProps) {
  return (
    <div className="border-edge bg-surface rounded-lg border p-6 shadow-xs">
      <h2 className="text-strong mb-2 text-xl font-semibold">
        {logo ? (
          <>
            {React.createElement(logo, {
              alt: `${title} logo`,
              className: "h-7 pb-1 sm:h-10 sm:pb-2 fill-blue-600"
            })}
          </>
        ) : (
          <>{title}</>
        )}
      </h2>
      <p className="text-muted mb-4">{description}</p>
      <IntentPrefetchLink
        href={href}
        swrKeys={href.includes("/gentag") ? [GENTAG_TEMPLATES_KEY] : undefined}
      >
        <button className="bg-primary-600 hover:bg-surface hover:text-primary-600 flex w-full flex-row items-center justify-center gap-2 rounded-lg px-6 py-3 text-white outline outline-0 transition hover:font-semibold hover:outline-2 hover:outline-blue-600">
          <ArrowTopRightOnSquareIcon className="h-5 w-5" aria-hidden="true" />{" "}
          Access application
        </button>
      </IntentPrefetchLink>
    </div>
  );
}
