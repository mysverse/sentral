import { PageContainer } from "components/ui/page-container";

export const metadata = {
  title: "inVote"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageContainer>{children}</PageContainer>;
}
