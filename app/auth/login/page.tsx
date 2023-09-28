"use client";

import Image from "next/image";
import FeatureImage from "public/img/mysverse_feature.webp";
import LoginElement from "./loginElement";
import { Suspense, useState } from "react";

export default function LoginPage() {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  return (
    <Suspense>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto h-full w-full max-w-sm lg:w-96">
            <LoginElement imageLoaded={imageLoaded} />
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            onLoadingComplete={() => {
              setImageLoaded(true);
            }}
            src={FeatureImage}
            alt="Feature image of Bandar"
            width={1024}
            height={512}
            priority={true}
          />
        </div>
      </div>
    </Suspense>
  );
}
