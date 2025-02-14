import { Suspense } from "react";

export const metadata = {
  title: "Certificate Verifier"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="bg-linear-to-l from-blue-500 via-blue-700 to-blue-800">
      <body className="flex min-h-dvh flex-row items-center justify-center">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
