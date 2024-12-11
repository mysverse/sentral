"use client";

import { ConstituencyData } from "utils/invote";
import Image from "next/image";
import Link from "next/link";
import { getColourByName } from "app/(main)/dashboard/invote/_utils/chartUtils";
import { useState } from "react";

/**
 * Processes the input string by removing the word "Shadow" and replacing "and" with "&".
 *
 * @param input - The original string to be processed.
 * @returns The processed string with "Shadow" removed and "and" replaced by "&".
 */
function processString(input: string): string {
  // Remove all instances of "Shadow"
  // The 'g' flag ensures all occurrences are removed
  let result = input.replace(/Shadow/g, "");

  // Replace all instances of "and" with "&"
  // The '\b' ensures that only whole words "and" are replaced
  result = result.replace(/\band\b/g, "&");

  // Optionally, clean up any extra whitespace resulting from removals
  result = result.replace(/\s{2,}/g, " ").trim();

  return result;
}

export default function ConstituencyCard({
  contestant,
  thumbnail
}: {
  contestant: ConstituencyData;
  thumbnail?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const partyColour = getColourByName(contestant.party);

  return (
    <Link
      href={
        contestant.userId
          ? `https://www.roblox.com/users/${contestant.userId}/profile`
          : `https://www.roblox.com/search/users?keyword=${contestant.username}`
      }
      target="_blank"
      style={{
        backgroundColor: isHovered ? partyColour : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="group relative flex h-24 overflow-hidden rounded border border-gray-200 transition hover:border-none"
    >
      <div
        className="w-2 transition"
        style={{
          backgroundColor: partyColour
        }}
      ></div>
      <div className="relative z-10 ml-3 flex flex-col items-center justify-center drop-shadow-[0_0px_2px_rgba(255,255,255,1)] group-hover:drop-shadow-none sm:ml-4">
        <div className="flex flex-col">
          <p className="font-medium group-hover:text-white">
            @{contestant.username}
          </p>
          <p className="text-sm text-gray-500 group-hover:text-white">
            {contestant.party}
          </p>
          {contestant.shadowCabinet && (
            <p className="mt-1 text-xs text-gray-500 group-hover:text-white">
              {processString(contestant.shadowCabinet)}
            </p>
          )}
        </div>
      </div>
      {thumbnail && (
        <div className="absolute mb-2 flex h-full w-full flex-row items-end justify-end">
          <div className="size-28 sm:size-32">
            <Image
              src={thumbnail}
              height={352}
              width={352}
              alt={`${contestant.username}'s avatar`}
              className="scale-125 opacity-60 transition group-hover:scale-150 group-hover:opacity-70 group-hover:blur-sm group-hover:contrast-200 group-hover:grayscale"
            />
          </div>
        </div>
      )}
    </Link>
  );
}
