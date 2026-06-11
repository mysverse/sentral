import { Redis } from "@upstash/redis";
import { logAppError, toAppError } from "./errors";

// Initialize Redis
export const redis = Redis.fromEnv();

// Safe wrappers: a Redis outage degrades to uncached origin fetches
// instead of failing the whole request.

export async function safeRedisGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
    return null;
  }
}

export async function safeRedisMget<T>(keys: string[]): Promise<(T | null)[]> {
  if (keys.length === 0) {
    return [];
  }
  try {
    return await redis.mget<(T | null)[]>(...keys);
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
    return keys.map(() => null);
  }
}

export async function safeRedisSet(
  key: string,
  value: unknown,
  opts?: { ttlSeconds?: number }
): Promise<void> {
  try {
    if (opts?.ttlSeconds) {
      await redis.set(key, value, { ex: opts.ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
  }
}

// Upstash mset cannot set TTLs, so expiring batch writes go through a pipeline
export async function safeRedisMset(
  record: Record<string, unknown>,
  ttlSeconds?: number
): Promise<void> {
  if (Object.keys(record).length === 0) {
    return;
  }
  try {
    if (ttlSeconds) {
      const pipeline = redis.pipeline();
      for (const [key, value] of Object.entries(record)) {
        pipeline.set(key, value, { ex: ttlSeconds });
      }
      await pipeline.exec();
    } else {
      await redis.mset(record);
    }
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
  }
}

export async function safeRedisDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    logAppError(toAppError(error, { service: "redis" }));
  }
}
