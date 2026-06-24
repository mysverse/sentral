import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const apply = process.argv.includes("--apply");
const cleanup = process.argv.includes("--cleanup");
const BATCH_SIZE = 500;

const migrations = [
  {
    pattern: "asset:*",
    target: () => "cache:v2:assets",
    field: (key: string) => key.slice("asset:".length),
    ttlSeconds: 24 * 60 * 60
  },
  {
    pattern: "user:*",
    target: () => "cache:v2:users",
    field: (key: string) => key.slice("user:".length),
    ttlSeconds: 12 * 60 * 60
  },
  {
    pattern: "thumbnail:*",
    target: () => "cache:v2:thumbnails",
    field: (key: string) => key.slice("thumbnail:".length),
    ttlSeconds: 6 * 60 * 60
  },
  {
    pattern: "avatar:*",
    target: (key: string) => {
      const [, type, size] = key.split(":");
      return `cache:v2:avatars:${type}:${size}`;
    },
    field: (key: string) => key.split(":")[3],
    ttlSeconds: 60 * 60
  },
  {
    pattern: "roblox_user_id_to_clerk:*",
    target: () => "identity:v2:roblox-clerk",
    field: (key: string) => key.slice("roblox_user_id_to_clerk:".length),
    ttlSeconds: 48 * 60 * 60,
    wholeHashTtl: true
  }
] as const;

function normalizeValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function scan(pattern: string) {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const [nextCursor, batch] = await redis.scan(cursor, {
      match: pattern,
      count: 1000
    });
    cursor = String(nextCursor);
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}

async function migrate() {
  const totals: Record<string, number> = {};
  for (const migration of migrations) {
    const keys = await scan(migration.pattern);
    totals[migration.pattern] = keys.length;
    console.log(`${migration.pattern}: ${keys.length} legacy keys`);

    if (!apply || keys.length === 0) {
      continue;
    }

    const grouped = new Map<string, Record<string, unknown>>();
    for (let index = 0; index < keys.length; index += BATCH_SIZE) {
      const batch = keys.slice(index, index + BATCH_SIZE);
      const values = await redis.mget<unknown[]>(...batch);
      batch.forEach((key, valueIndex) => {
        const value = values[valueIndex];
        if (value === null) {
          return;
        }
        const target = migration.target(key);
        const record = grouped.get(target) ?? {};
        record[migration.field(key)] = normalizeValue(value);
        grouped.set(target, record);
      });
    }

    for (const [target, record] of grouped) {
      const entries = Object.entries(record);
      for (let index = 0; index < entries.length; index += BATCH_SIZE) {
        const chunk = Object.fromEntries(
          entries.slice(index, index + BATCH_SIZE)
        );
        if ("wholeHashTtl" in migration && migration.wholeHashTtl) {
          await redis.hset(target, chunk);
        } else {
          await redis.hsetex(
            target,
            { expiration: { ex: migration.ttlSeconds } },
            chunk
          );
        }
      }
      if ("wholeHashTtl" in migration && migration.wholeHashTtl) {
        await redis.expire(target, migration.ttlSeconds);
      }
    }

    if (cleanup) {
      for (let index = 0; index < keys.length; index += BATCH_SIZE) {
        await redis.del(...keys.slice(index, index + BATCH_SIZE));
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? (cleanup ? "apply-and-cleanup" : "apply") : "dry-run",
        totals
      },
      null,
      2
    )
  );
}

void migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
