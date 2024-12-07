import { clsx } from "clsx";
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
      className={clsx(
        "h-full bg-gradient-to-l from-blue-500 via-blue-700 to-blue-800",
        publicSans.className
      )}
    >
      <body className="h-full">
        <Toaster
          richColors
          toastOptions={{ className: publicSans.className }}
        />
        {children}
      </body>
    </html>
  );
}
