import RobloxAccountRequired from "components/robloxAccountRequired";
import { PageContainer } from "components/ui/page-container";
import { getFeedbackResources } from "utils/feedback";
import { getUserId } from "utils/user";

function NoAccess() {
  return (
    <PageContainer>
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <div className="text-center">
          <h1 className="text-strong text-3xl font-extrabold">
            You are not authorised to access this page
          </h1>
          <p className="text-muted mt-4 text-lg">
            You must be a member of a MYSverse internal team to access this
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
  const userId = await getUserId();

  if (!userId) {
    return <RobloxAccountRequired />;
  }

  const resources = await getFeedbackResources(userId);

  if (resources.length === 0) {
    return <NoAccess />;
  }

  return <PageContainer>{children}</PageContainer>;
}
