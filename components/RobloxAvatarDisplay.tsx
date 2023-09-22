"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

export default function RobloxAvatarDisplay({
  id,
  name,
  image
}: {
  id: string;
  name: string;
  image: string;
}) {
  return (
    <a
      onClick={() => {
        signOut({ redirect: true, callbackUrl: "/auth/login" });
      }}
      className="group block flex-shrink-0 hover:cursor-pointer hover:opacity-75"
    >
      <div className="flex flex-row lg:flex-row-reverse items-center">
        <Image
          className="inline-block h-14 w-14 lg:h-10 lg:w-10 rounded-full bg-gray-100 drop-shadow-sm"
          src={image}
          alt={`Profile picture of @${name}`}
          width={150}
          height={150}
        />
        <div className="ml-3 mr-0 text-left lg:text-right lg:mr-3 lg:ml-0">
          <p className="text-base lg:text-sm font-medium text-white">
            {`@${name}`}
          </p>
          <p className="text-sm lg:text-xs font-regular text-white">Sign out</p>
        </div>
      </div>
    </a>
  );
}
