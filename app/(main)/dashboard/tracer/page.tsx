import MysverseStats from "components/bandarStats";
import LebuhrayaLeaderboard from "./components/LebuhrayaLeaderboard";
import { getLeaderboardData, getMysverseData } from "components/fetcher";
import { auth } from "auth";

export default async function Main() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const [leaderboardData, weeklyData, schoolData, foodData, mysverseData] =
    await Promise.all([
      getLeaderboardData(),
      getLeaderboardData("weekly"),
      getLeaderboardData("school"),
      getLeaderboardData("food"),
      getMysverseData(parseInt(session.user.id))
    ]);

  // const testId = 31585182;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LebuhrayaLeaderboard limit={10} data={leaderboardData} order={1} />
        <LebuhrayaLeaderboard
          limit={10}
          data={weeklyData}
          type="weekly"
          order={2}
        />
        <LebuhrayaLeaderboard limit={10} data={schoolData} type="school" />
        <LebuhrayaLeaderboard limit={10} data={foodData} type="food" />
      </div>
      <div className="mt-8">
        <MysverseStats data={mysverseData} />
      </div>
    </div>
  );
}
