import ProtectedLayout from "components/ProtectedLayout";

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
