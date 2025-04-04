import { auth } from "auth";
import DefaultTransitionLayout from "components/transition";
import RobloxAccountRequired from "components/robloxAccountRequired";
import { getGroupRoles } from "utils/sim";

function NoAccess() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              You are not authorised to access this page
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              You must be a member of a MYSverse Sim group to access this page.
            </p>
          </div>
        </div>
      </DefaultTransitionLayout>
    </div>
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

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
