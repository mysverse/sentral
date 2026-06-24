import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const pipeline = {
    hset: vi.fn(),
    expire: vi.fn(),
    rename: vi.fn(),
    exec: vi.fn().mockResolvedValue([])
  };
  return {
    pipeline,
    redis: {
      get: vi.fn(),
      mget: vi.fn(),
      set: vi.fn(),
      mset: vi.fn(),
      del: vi.fn(),
      hmget: vi.fn(),
      hset: vi.fn(),
      hsetex: vi.fn(),
      hdel: vi.fn(),
      pipeline: vi.fn(() => pipeline)
    }
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => mocks.redis
  }
}));

vi.mock("./errors", () => ({
  logAppError: vi.fn(),
  toAppError: (error: unknown) => error
}));

import { safeRedisHmget, safeRedisHset, safeRedisReplaceHash } from "./redis";

describe("Redis v2 hash helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pipeline.exec.mockResolvedValue([]);
  });

  it("writes an expiring batch with one HSETEX command", async () => {
    await safeRedisHset(
      "cache:v2:assets",
      { "1": { id: 1 }, "2": { id: 2 } },
      { ttlSeconds: 3600 }
    );

    expect(mocks.redis.hsetex).toHaveBeenCalledTimes(1);
    expect(mocks.redis.hsetex).toHaveBeenCalledWith(
      "cache:v2:assets",
      { expiration: { ex: 3600 } },
      { "1": { id: 1 }, "2": { id: 2 } }
    );
  });

  it("restores HMGET results to requested field order", async () => {
    mocks.redis.hmget.mockResolvedValue({
      "3": { id: 3 },
      "1": { id: 1 }
    });

    await expect(
      safeRedisHmget<{ id: number }>("cache:v2:assets", ["1", "2", "3"])
    ).resolves.toEqual([{ id: 1 }, null, { id: 3 }]);
  });

  it("replaces the identity map in three pipelined commands", async () => {
    await safeRedisReplaceHash(
      "identity:v2:roblox-clerk",
      { "1055048": "user_123" },
      172800
    );

    expect(mocks.pipeline.hset).toHaveBeenCalledTimes(1);
    expect(mocks.pipeline.expire).toHaveBeenCalledTimes(1);
    expect(mocks.pipeline.rename).toHaveBeenCalledTimes(1);
    expect(mocks.pipeline.exec).toHaveBeenCalledTimes(1);
  });
});
