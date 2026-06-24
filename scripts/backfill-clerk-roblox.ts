import { clerkClient } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";
import { backfillClerkRoblox } from "./lib/clerk-roblox-backfill";

const apply = process.argv.includes("--apply");
const redis = Redis.fromEnv();

async function main() {
  const client = await clerkClient();
  const summary = await backfillClerkRoblox({ client, redis, apply });
  console.log(JSON.stringify(summary, null, 2));
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
