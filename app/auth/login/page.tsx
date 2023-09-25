import Image from "next/image";
import FeatureImage from "public/img/bandar_feature_image.webp";
import LoginElement from "./loginElement";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <LoginElement />
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={FeatureImage}
            alt="Feature image of Bandar"
            width={1919}
            height={1000}
            priority={true}
          />
        </div>
      </div>
    </Suspense>
  );
}
