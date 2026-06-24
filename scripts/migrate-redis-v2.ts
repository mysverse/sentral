import { Redis } from "@upstash/redis";
import { migrateRedisV2 } from "./lib/redis-v2-migration";

const redis = Redis.fromEnv();
const apply = process.argv.includes("--apply");
const cleanup = process.argv.includes("--cleanup");

async function migrate() {
  const summary = await migrateRedisV2({ redis, apply, cleanup });
  console.log(JSON.stringify(summary, null, 2));
}

void migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
