import { getLiveLeaderboard } from "lib/data/leaderboard";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage({
  params
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const initialLeaderboard = await getLiveLeaderboard(eventId);
  return (
    <LeaderboardClient
      eventId={eventId}
      initialLeaderboard={initialLeaderboard.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      }))}
    />
  );
}
