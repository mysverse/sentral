import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
// import { getLeaderboardData, getMysverseData } from "components/fetcher";

import DefaultTransitionLayout from "components/transition";
import { getPendingRequests, getPermissions } from "utils/finsys";
import PayoutRequestsTable from "../_components/PayoutRequestTable";

export default async function Main() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const permissions = await getPermissions(session.user.id);

  if (permissions.canEdit) {
    const data = await getPendingRequests();
    return (
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <DefaultTransitionLayout show={true} appear={true}>
            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
              <div className="container mx-auto p-2">
                <PayoutRequestsTable payoutRequests={data} adminMode={true} />
              </div>
            </div>
          </DefaultTransitionLayout>
        </div>
      </div>
    );
  }

  return <>Not authroised</>;

  // const [leaderboardData, mysverseData] = await Promise.all([
  //   getLeaderboardData(),
  //   getMysverseData(session.user.id)
  // ]);

  // const testId = 31585182;
}
