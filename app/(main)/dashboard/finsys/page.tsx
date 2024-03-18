import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
// import { getLeaderboardData, getMysverseData } from "components/fetcher";
import PayoutRequestComponent from "./_components/FinsysPage";
import DefaultTransitionLayout from "components/transition";
import { getPendingRequests } from "utils/finsys";

export default async function Main() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const data = await getPendingRequests(session.user.id);

  // const [leaderboardData, mysverseData] = await Promise.all([
  //   getLeaderboardData(),
  //   getMysverseData(session.user.id)
  // ]);

  // const testId = 31585182;

  return (
    <div className="mx-auto max-w-7xl px-3 pb-12 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-4 py-4 shadow sm:px-6">
          <PayoutRequestComponent payoutRequests={data} />
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
