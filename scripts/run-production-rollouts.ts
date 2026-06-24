import { clerkClient } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";
import { backfillClerkRoblox } from "./lib/clerk-roblox-backfill";
import {
  getProductionRolloutStatus,
  isProductionRolloutEnvironment,
  PRODUCTION_ROLLOUT_VERSION,
  runProductionRollout
} from "./lib/production-rollout";
import { migrateRedisV2 } from "./lib/redis-v2-migration";

const force = process.argv.includes("--force");
const statusOnly = process.argv.includes("--status");

async function main() {
  if (process.env.SKIP_PRODUCTION_ROLLOUTS === "1") {
    console.log("Production rollout explicitly skipped.");
    return;
  }

  if (!statusOnly && !isProductionRolloutEnvironment(process.env, force)) {
    console.log(
      "Skipping production rollout outside the Vercel production environment."
    );
    return;
  }

  const redis = Redis.fromEnv();

  if (statusOnly) {
    const status = await getProductionRolloutStatus(redis);
    console.log(
      JSON.stringify({ version: PRODUCTION_ROLLOUT_VERSION, status }, null, 2)
    );
    return;
  }

  const deploymentId =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_URL ??
    crypto.randomUUID();

  await runProductionRollout({
    redis,
    deploymentId,
    migrateRedis: () =>
      migrateRedisV2({
        redis,
        apply: true,
        cleanup: false
      }),
    backfillClerk: async () =>
      backfillClerkRoblox({
        client: await clerkClient(),
        redis,
        apply: true
      })
  });
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
