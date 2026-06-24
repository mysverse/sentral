import GentagSWRBoundary from "components/GentagSWRBoundary";
import { getNametagTemplates } from "lib/data/gentag";

export const metadata = {
  title: "GenTag"
};

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const templates = await getNametagTemplates();
  return (
    <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
      <GentagSWRBoundary templates={templates}>{children}</GentagSWRBoundary>
    </div>
  );
}
