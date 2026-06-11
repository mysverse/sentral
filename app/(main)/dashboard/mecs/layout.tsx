import { PageContainer } from "components/ui/page-container";

export const metadata = {
  title: "MECS"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageContainer>{children}</PageContainer>;
}
