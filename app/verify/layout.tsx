import Link from "next/link";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
          <div className="mx-3 flex flex-col items-center gap-2 rounded-lg bg-white p-5 text-center shadow-lg sm:gap-4 sm:p-8">
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
