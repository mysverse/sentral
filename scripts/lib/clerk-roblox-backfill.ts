import type { clerkClient } from "@clerk/nextjs/server";
import type { Redis } from "@upstash/redis";

const CONCURRENCY = 10;
const IDENTITY_TTL_SECONDS = 48 * 60 * 60;
const IDENTITY_KEY = "identity:v2:roblox-clerk";
const MINIMUM_REPLACEMENT_RATIO = 0.8;
const MINIMUM_GUARDED_MAPPING_COUNT = 20;

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;

export type ClerkBackfillSummary = {
  mode: "dry-run" | "apply";
  users: number;
  linked: number;
  metadataUpdates: number;
  mappings: number;
};

export function validateIdentityMappingReplacement(
  existingMappings: number,
  replacementMappings: number
) {
  if (existingMappings < MINIMUM_GUARDED_MAPPING_COUNT) {
    return;
  }

  const minimumExpected = Math.ceil(
    existingMappings * MINIMUM_REPLACEMENT_RATIO
  );
  if (replacementMappings < minimumExpected) {
    throw new Error(
      `Refusing to replace ${existingMappings} Roblox identity mappings with ${replacementMappings}. Check that Clerk and Redis use the same production environment.`
    );
  }
}

export async function backfillClerkRoblox({
  client,
  redis,
  apply
}: {
  client: ClerkClient;
  redis: Redis;
  apply: boolean;
}): Promise<ClerkBackfillSummary> {
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
  const metadataUpdates: Array<{
    userId: string;
    robloxId: string;
    robloxUsername: string | null;
  }> = [];

  for (const user of users) {
    const account = user.externalAccounts.find(
      (candidate) => candidate.provider === "oauth_custom_roblox"
    );
    if (!account) {
      continue;
    }

    linked += 1;
    mappings[account.externalId] = user.id;

    const currentId = user.publicMetadata.roblox_id;
    const currentUsername = user.publicMetadata.roblox_username;
    if (
      currentId === account.externalId &&
      currentUsername === account.username
    ) {
      continue;
    }

    updated += 1;
    metadataUpdates.push({
      userId: user.id,
      robloxId: account.externalId,
      robloxUsername: account.username
    });
  }

  if (apply) {
    const existingMappings = await redis.hlen(IDENTITY_KEY);
    validateIdentityMappingReplacement(
      existingMappings,
      Object.keys(mappings).length
    );

    for (let index = 0; index < metadataUpdates.length; index += CONCURRENCY) {
      const batch = metadataUpdates.slice(index, index + CONCURRENCY);
      await Promise.all(
        batch.map((update) =>
          client.users.updateUserMetadata(update.userId, {
            publicMetadata: {
              roblox_id: update.robloxId,
              roblox_username: update.robloxUsername
            }
          })
        )
      );
    }
  }

  if (apply && Object.keys(mappings).length > 0) {
    const staging = `${IDENTITY_KEY}:staging:${crypto.randomUUID()}`;
    const pipeline = redis.pipeline();
    pipeline.hset(staging, mappings);
    pipeline.expire(staging, IDENTITY_TTL_SECONDS);
    pipeline.rename(staging, IDENTITY_KEY);
    await pipeline.exec();
  }

  return {
    mode: apply ? "apply" : "dry-run",
    users: users.length,
    linked,
    metadataUpdates: updated,
    mappings: Object.keys(mappings).length
  };
}
