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
    <html lang="en" className={clsx("bg-slate-200", publicSans.className)}>
      <body className="flex min-h-dvh flex-col">
        <Toaster
          richColors
          toastOptions={{ className: publicSans.className }}
        />
        <Navigation />
        <main className="-mt-32 flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
