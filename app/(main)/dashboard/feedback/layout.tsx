import DefaultTransitionLayout from "components/transition";
import RobloxAccountRequired from "components/robloxAccountRequired";
import { getFeedbackResources } from "utils/feedback";
import { getUserId } from "utils/user";

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
              You must be a member of a MYSverse internal team to access this
              page.
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
  const userId = await getUserId();

  if (!userId) {
    return <RobloxAccountRequired />;
  }

  const resources = await getFeedbackResources(userId);

  if (resources.length === 0) {
    return <NoAccess />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
