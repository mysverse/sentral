import { describe, expect, it, vi } from "vitest";
import {
  isProductionRolloutEnvironment,
  PRODUCTION_ROLLOUT_VERSION,
  runProductionRollout,
  type RolloutRedis,
  type RolloutStatus
} from "./production-rollout";

function makeRedis(initialStatus: RolloutStatus = {}) {
  const status = { ...initialStatus };
  let locked = false;

  return {
    status,
    redis: {
      hgetall: vi.fn(async () => ({ ...status })),
      set: vi.fn(async () => {
        if (locked) {
          return null;
        }
        locked = true;
        return "OK";
      }),
      hset: vi.fn(async (_key: string, record: Record<string, unknown>) => {
        Object.assign(status, record);
        return Object.keys(record).length;
      }),
      del: vi.fn(async () => {
        locked = false;
        return 1;
      })
    } satisfies RolloutRedis
  };
}

describe("production rollout", () => {
  it("skips completed rollout versions without acquiring the lock", async () => {
    const completed = {
      completedAt: "2026-06-25T00:00:00.000Z",
      deploymentId: "deployment_1",
      summary: {}
    };
    const { redis } = makeRedis({ redis: completed, clerk: completed });
    const migrateRedis = vi.fn();
    const backfillClerk = vi.fn();

    const result = await runProductionRollout({
      redis,
      deploymentId: "deployment_2",
      migrateRedis,
      backfillClerk,
      log: vi.fn()
    });

    expect(result.skipped).toBe(true);
    expect(redis.set).not.toHaveBeenCalled();
    expect(migrateRedis).not.toHaveBeenCalled();
    expect(backfillClerk).not.toHaveBeenCalled();
  });

  it("runs both steps once and records resumable completion markers", async () => {
    const { redis, status } = makeRedis();
    const order: string[] = [];

    const result = await runProductionRollout({
      redis,
      deploymentId: "deployment_1",
      migrateRedis: async () => {
        order.push("redis");
        return { migrated: 6039 };
      },
      backfillClerk: async () => {
        order.push("clerk");
        return { updated: 1 };
      },
      log: vi.fn(),
      now: () => new Date("2026-06-25T00:00:00.000Z")
    });

    expect(result.skipped).toBe(false);
    expect(order).toEqual(["redis", "clerk"]);
    expect(status.redis).toEqual(
      expect.objectContaining({ deploymentId: "deployment_1" })
    );
    expect(status.clerk).toEqual(
      expect.objectContaining({ deploymentId: "deployment_1" })
    );
    expect(redis.del).toHaveBeenCalledTimes(1);
  });

  it("resumes from the first incomplete step after a partial rollout", async () => {
    const completed = {
      completedAt: "2026-06-25T00:00:00.000Z",
      deploymentId: "deployment_1",
      summary: {}
    };
    const { redis } = makeRedis({ redis: completed });
    const migrateRedis = vi.fn();
    const backfillClerk = vi.fn(async () => ({ updated: 1 }));

    await runProductionRollout({
      redis,
      deploymentId: "deployment_2",
      migrateRedis,
      backfillClerk,
      log: vi.fn()
    });

    expect(migrateRedis).not.toHaveBeenCalled();
    expect(backfillClerk).toHaveBeenCalledTimes(1);
  });

  it("uses a stable versioned rollout namespace", () => {
    expect(PRODUCTION_ROLLOUT_VERSION).toBe("cache-v2-2026-06-25");
  });

  it("runs automatically only for production Vercel builds", () => {
    expect(
      isProductionRolloutEnvironment({ VERCEL_ENV: "production" }, false)
    ).toBe(true);
    expect(
      isProductionRolloutEnvironment({ VERCEL_ENV: "preview" }, false)
    ).toBe(false);
    expect(isProductionRolloutEnvironment({}, true)).toBe(true);
  });
});
