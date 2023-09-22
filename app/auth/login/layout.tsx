import { clsx } from "clsx";
import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap"
});

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
      <body className="h-full">{children}</body>
    </html>
  );
}
