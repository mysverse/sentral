"use client";

import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";

export default function RobloxAvatarDisplay({
  name,
  image
}: {
  name: string;
  image?: string | null;
}) {
  return (
    <SignOutButton redirectUrl="/auth/login">
      <a className="group block flex-shrink-0 transition hover:cursor-pointer hover:opacity-80">
        <div className="flex flex-row items-center lg:flex-row-reverse">
          {image && (
            <Image
              className="inline-block h-14 w-14 rounded-full bg-gray-100 drop-shadow-sm lg:h-10 lg:w-10"
              src={image}
              alt={`Profile picture of @${name}`}
              width={150}
              height={150}
              unoptimized
            />
          )}
          <div className="ml-3 mr-0 text-left lg:ml-0 lg:mr-3 lg:text-right">
            <p className="text-base font-medium text-white lg:text-sm">
              {`${name}`}
            </p>
            <p className="font-regular text-sm text-white lg:text-xs">
              Sign out
            </p>
          </div>
        </div>
      </a>
    </SignOutButton>
  );
}
