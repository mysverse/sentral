import Link from "next/link";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-dvh flex-row items-center justify-center bg-gray-100">
          <div className="mx-4 flex grow flex-col items-center gap-2 rounded-lg bg-white px-5 py-6 text-center shadow-lg sm:min-w-96 sm:grow-0 sm:gap-4 sm:px-8">
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
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
