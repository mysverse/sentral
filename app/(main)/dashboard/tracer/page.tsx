import MysverseStats from "components/bandarStats";
import LebuhrayaLeaderboard from "./components/LebuhrayaLeaderboard";
import { getLeaderboardData, getMysverseData } from "components/fetcher";
import { auth } from "auth";

export const metadata = {
  title: "Tracer"
};

export default async function Main() {
  const session = await auth();
  const userIdString = session?.user.id;
  const userId = userIdString ? parseInt(userIdString) : undefined;

  const [leaderboardData, weeklyData, schoolData, foodData, mysverseData] =
    await Promise.all([
      getLeaderboardData(),
      getLeaderboardData("weekly"),
      getLeaderboardData("school"),
      getLeaderboardData("food"),
      userId ? getMysverseData(userId) : undefined
    ]);

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
        {mysverseData ? (
          <MysverseStats data={mysverseData} />
        ) : (
          <>
            <div className="rounded-lg bg-white px-4 py-4 shadow sm:px-6">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  Roblox account not connected
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                  You must have a linked Roblox account to access this content.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
