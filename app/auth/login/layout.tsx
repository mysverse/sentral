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
        "h-full bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-sky-400 to-indigo-900",
        publicSans.className
      )}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
