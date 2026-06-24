import { clerkClient } from "@clerk/nextjs/server";
import { Redis } from "@upstash/redis";

const apply = process.argv.includes("--apply");
const CONCURRENCY = 10;
const redis = Redis.fromEnv();

async function main() {
  const client = await clerkClient();
  const users = [];
  const limit = 500;
  let response = await client.users.getUserList({ limit });
  users.push(...response.data);
  while (users.length < response.totalCount) {
    response = await client.users.getUserList({
      limit,
      offset: users.length
    });
    users.push(...response.data);
  }

  let linked = 0;
  let updated = 0;
  const mappings: Record<string, string> = {};

  for (let index = 0; index < users.length; index += CONCURRENCY) {
    const batch = users.slice(index, index + CONCURRENCY);
    await Promise.all(
      batch.map(async (user) => {
        const account = user.externalAccounts.find(
          (candidate) => candidate.provider === "oauth_custom_roblox"
        );
        if (!account) {
          return;
        }
        linked += 1;
        mappings[account.externalId] = user.id;

        const currentId = user.publicMetadata.roblox_id;
        const currentUsername = user.publicMetadata.roblox_username;
        if (
          currentId === account.externalId &&
          currentUsername === account.username
        ) {
          return;
        }

        updated += 1;
        if (apply) {
          await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
              roblox_id: account.externalId,
              roblox_username: account.username
            }
          });
        }
      })
    );
  }

  if (apply && Object.keys(mappings).length > 0) {
    const staging = `identity:v2:roblox-clerk:staging:${crypto.randomUUID()}`;
    const pipeline = redis.pipeline();
    pipeline.hset(staging, mappings);
    pipeline.expire(staging, 48 * 60 * 60);
    pipeline.rename(staging, "identity:v2:roblox-clerk");
    await pipeline.exec();
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        users: users.length,
        linked,
        metadataUpdates: updated,
        mappings: Object.keys(mappings).length
      },
      null,
      2
    )
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
