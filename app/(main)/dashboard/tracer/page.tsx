import MysverseStats from "components/bandarStats";
import LebuhrayaLeaderboard from "./components/LebuhrayaLeaderboard";
import { getLeaderboardData, getMysverseData } from "components/fetcher";
import { auth } from "auth";
import { Card } from "components/ui/card";
import { InlineUnavailable } from "components/errorState";

export const metadata = {
  title: "Tracer"
};

export default async function Main() {
  const session = await auth();
  const userIdString = session?.user.id;
  const userId = userIdString ? parseInt(userIdString) : undefined;

  const [
    leaderboardResult,
    weeklyResult,
    schoolResult,
    foodResult,
    mysverseResult
  ] = await Promise.allSettled([
    getLeaderboardData(),
    getLeaderboardData("weekly"),
    getLeaderboardData("school"),
    getLeaderboardData("food"),
    userId ? getMysverseData(userId) : Promise.resolve(undefined)
  ]);

  const leaderboardData =
    leaderboardResult.status === "fulfilled"
      ? leaderboardResult.value
      : undefined;
  const weeklyData =
    weeklyResult.status === "fulfilled" ? weeklyResult.value : undefined;
  const schoolData =
    schoolResult.status === "fulfilled" ? schoolResult.value : undefined;
  const foodData =
    foodResult.status === "fulfilled" ? foodResult.value : undefined;
  const mysverseData =
    mysverseResult.status === "fulfilled" ? mysverseResult.value : undefined;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {leaderboardData ? (
          <LebuhrayaLeaderboard limit={10} data={leaderboardData} order={1} />
        ) : (
          <InlineUnavailable label="Leaderboard is temporarily unavailable." />
        )}
        {weeklyData ? (
          <LebuhrayaLeaderboard
            limit={10}
            data={weeklyData}
            type="weekly"
            order={2}
          />
        ) : (
          <InlineUnavailable label="Weekly leaderboard is temporarily unavailable." />
        )}
        {schoolData ? (
          <LebuhrayaLeaderboard limit={10} data={schoolData} type="school" />
        ) : (
          <InlineUnavailable label="School leaderboard is temporarily unavailable." />
        )}
        {foodData ? (
          <LebuhrayaLeaderboard limit={10} data={foodData} type="food" />
        ) : (
          <InlineUnavailable label="Food leaderboard is temporarily unavailable." />
        )}
      </div>
      <div className="mt-8">
        {mysverseData ? (
          <MysverseStats data={mysverseData} />
        ) : userId ? (
          <InlineUnavailable label="Personal stats are temporarily unavailable." />
        ) : (
          <Card padding="sm">
            <div className="text-center">
              <h1 className="text-strong text-3xl font-extrabold">
                Roblox account not connected
              </h1>
              <p className="text-muted mt-4 text-lg">
                You must have a linked Roblox account to access this content.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
