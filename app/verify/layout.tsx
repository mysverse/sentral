import { Suspense } from "react";
import Link from "next/link";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";

export const metadata = {
  title: "Certificate Verifier"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-gradient flex min-h-dvh grow flex-row items-center justify-center">
      <div className="bg-surface text-strong mx-4 flex grow flex-col items-center gap-2 rounded-lg px-5 py-6 text-center shadow-lg sm:min-w-96 sm:grow-0 sm:gap-4 sm:px-8">
        <Link
          href={"/"}
          className="transition hover:opacity-80"
          passHref={true}
        >
          <SentralLogo
            height={43}
            width={128}
            alt="MYSverse Sentral Logo"
            className="fill-blue-600"
          />
        </Link>
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
