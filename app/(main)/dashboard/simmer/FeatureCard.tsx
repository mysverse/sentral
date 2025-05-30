"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <h2 className="mb-2 text-xl font-semibold text-gray-800">
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
      <p className="mb-4 text-gray-600">{description}</p>
      <Link href={href}>
        <button className="flex w-full flex-row items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white outline outline-0 transition hover:bg-white hover:font-semibold hover:text-blue-600 hover:outline-2 hover:outline-blue-600">
          <ArrowTopRightOnSquareIcon className="h-5 w-5" aria-hidden="true" />{" "}
          Access application
        </button>
      </Link>
    </div>
  );
}
