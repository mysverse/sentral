"use client";

import { ConstituencyData } from "utils/invote";
import Image from "next/image";
import Link from "next/link";
import { getColourByName } from "app/(main)/dashboard/invote/_utils/chartUtils";
import { useState } from "react";
import { motion } from "motion/react";

export default function ConstituencyCard({
  contestant,
  thumbnail,
  index
}: {
  contestant: ConstituencyData;
  thumbnail: string;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const partyColour = getColourByName(contestant.party);
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        ease: "easeOut",
        duration: 0.3,
        delay: Math.min(index, 18) * 0.15
      }}
    >
      <Link
        key={contestant.userId}
        href={`https://www.roblox.com/users/${contestant.userId}/profile`}
        target="_blank"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? partyColour : undefined
        }}
        className="group relative flex h-24 overflow-hidden rounded border border-gray-200 transition hover:border-none"
      >
        <div
          className="w-2"
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
            {/* {contestant.shadowCabinet && (
              <p className="mt-1 text-xs text-gray-500 group-hover:text-white">
                {contestant.shadowCabinet}
              </p>
            )} */}
          </div>
        </div>
        <div className="absolute mb-2 flex h-full w-full flex-row items-end justify-end">
          <div className="size-28 sm:size-32">
            <Image
              src={thumbnail}
              height={420}
              width={420}
              alt={`${contestant.username}'s avatar`}
              className="scale-125 opacity-50 transition group-hover:scale-150 group-hover:opacity-70 group-hover:blur-sm group-hover:contrast-200 group-hover:grayscale"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
