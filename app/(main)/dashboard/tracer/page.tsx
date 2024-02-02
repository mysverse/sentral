import MysverseStats from "components/bandarStats";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import LebuhrayaLeaderboard from "./components/LebuhrayaLeaderboard";
import { getLeaderboardData, getMysverseData } from "components/fetcher";

export default async function Main() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const [leaderboardData, mysverseData] = await Promise.all([
    getLeaderboardData(),
    getMysverseData(session.user.id)
  ]);

  // const testId = 31585182;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <LebuhrayaLeaderboard data={leaderboardData} />
      <div className="mt-8">
        <MysverseStats data={mysverseData} />
      </div>
    </div>
  );
}
