import { auth } from "auth";
import RobloxAccountRequired from "components/robloxAccountRequired";
import { PageContainer } from "components/ui/page-container";
import { getGroupRoles } from "utils/sim";

function NoAccess() {
  return (
    <PageContainer>
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <div className="text-center">
          <h1 className="text-strong text-3xl font-extrabold">
            You are not authorised to access this page
          </h1>
          <p className="text-muted mt-4 text-lg">
            You must be a member of a MYSverse Sim group to access this page.
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
  const session = await auth();
  const userIdString = session?.user.id;

  if (!userIdString) {
    return <RobloxAccountRequired />;
  }

  const userId = parseInt(userIdString);

  const groups = await getGroupRoles(userId);
  const authorised = groups.length > 0;

  if (!authorised) {
    return <NoAccess />;
  }

  return <PageContainer>{children}</PageContainer>;
}
