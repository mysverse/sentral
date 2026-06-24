import Footer from "components/footer";
import Navigation from "components/nav";
import { Suspense } from "react";

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-page flex grow flex-col">
      <Suspense fallback={<div className="bg-brand-gradient h-16" />}>
        <Navigation />
      </Suspense>
      <main className="-mt-32 grow">{children}</main>
      <Footer />
    </div>
  );
}
