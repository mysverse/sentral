import { PageContainer } from "components/ui/page-container";
import { checkPermissions } from "./utils";

export const metadata = {
  title: "Certifier"
};

function NoAccess() {
  return (
    <PageContainer>
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <div className="text-center">
          <h1 className="text-strong text-3xl font-extrabold">
            You are not authorised to access this page
          </h1>
          <p className="text-muted mt-4 text-lg">
            You must be a member of a MYSverse Administration to access this
            page.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default async function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const authorised = await checkPermissions();
  if (!authorised) {
    return <NoAccess />;
  }
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6">{children}</div>
    </PageContainer>
  );
}
