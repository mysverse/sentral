import { Redis } from "@upstash/redis";
import { logAppError, toAppError } from "./errors";

// Initialize Redis
export const redis = Redis.fromEnv();

// Safe wrappers: a Redis outage degrades to uncached origin fetches
// instead of failing the whole request.

export async function safeRedisHmget<T>(
  key: string,
  fields: string[]
): Promise<(T | null)[]> {
  if (fields.length === 0) {
    return [];
  }
  try {
    const values = await redis.hmget<Record<string, T | null>>(key, ...fields);
    return fields.map((field) => values?.[field] ?? null);
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
    return fields.map(() => null);
  }
}

export async function safeRedisHset(
  key: string,
  record: Record<string, unknown>,
  opts?: { ttlSeconds?: number }
): Promise<void> {
  if (Object.keys(record).length === 0) {
    return;
  }
  try {
    if (opts?.ttlSeconds) {
      await redis.hsetex(key, { expiration: { ex: opts.ttlSeconds } }, record);
    } else {
      await redis.hset(key, record);
    }
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
  }
}

export async function safeRedisHdel(
  key: string,
  fields: string[]
): Promise<void> {
  if (fields.length === 0) {
    return;
  }
  try {
    await redis.hdel(key, ...fields);
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
  }
}

export async function safeRedisReplaceHash(
  key: string,
  record: Record<string, unknown>,
  ttlSeconds: number
): Promise<void> {
  if (Object.keys(record).length === 0) {
    try {
      await redis.del(key);
    } catch (error) {
      logAppError(toAppError(error, { service: "redis" }));
    }
    return;
  }

  const stagingKey = `${key}:staging:${crypto.randomUUID()}`;
  try {
    const pipeline = redis.pipeline();
    pipeline.hset(stagingKey, record);
    pipeline.expire(stagingKey, ttlSeconds);
    pipeline.rename(stagingKey, key);
    await pipeline.exec();
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
    try {
      await redis.del(stagingKey);
    } catch {
      // Best-effort cleanup only.
    }
  }
}
