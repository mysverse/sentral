import { clsx } from "clsx";
import { publicSans } from "styles/fonts";

import Image from "next/image";
import FeatureImage from "public/img/mysverse_feature.webp";

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={clsx(
        "h-full bg-gradient-to-l from-blue-500 via-blue-700 to-blue-800",
        publicSans.className
      )}
    >
      <body className="h-full">
        <div className="flex h-screen flex-1">
          <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto my-auto flex h-full w-full max-w-sm flex-col items-center justify-center lg:w-96">
              <div className="relative flex h-full items-center justify-center">
                {children}
              </div>
            </div>
          </div>
          <div className="relative hidden w-0 flex-1 lg:block">
            <Image
              className="absolute inset-0 h-full w-full object-cover"
              src={FeatureImage}
              alt="Feature image of Bandaraya"
              width={1024}
              height={512}
              priority={true}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
