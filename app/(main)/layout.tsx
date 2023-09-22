import { clsx } from "clsx";
import Footer from "components/footer";
import Navigation from "components/nav";
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
      className={clsx("h-full bg-slate-200", publicSans.className)}
    >
      <body className="h-full">
        <main className="h-screen">
          <Navigation />
          <div className="-mt-32">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
