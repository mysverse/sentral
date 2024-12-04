import { clsx } from "clsx";
import Footer from "components/footer";
import Navigation from "components/nav";
import { Toaster } from "sonner";
import { publicSans } from "styles/fonts";

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
        <Toaster />
        <Navigation />
        <main className="min-h-[55vh]">
          <div className="-mt-32">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
