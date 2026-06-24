import "server-only";

import prisma from "lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getLiveLeaderboard(eventId: string) {
  "use cache";
  cacheLife("live");
  cacheTag(`leaderboard:${eventId}`);
  const leaderboard = await prisma.leaderboard.findMany({
    where: { eventId },
    orderBy: { lapTime: "asc" },
    take: 50
  });
  return leaderboard.map((entry, index) => ({
    ...entry,
    position: index + 1
  }));
}
