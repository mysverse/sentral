import Footer from "components/footer";
import Navigation from "components/nav";

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-page flex grow flex-col">
      <Navigation />
      <main className="-mt-32 grow">{children}</main>
      <Footer />
    </div>
  );
}
