export const PRODUCTION_ROLLOUT_VERSION = "cache-v2-2026-06-25";

const STATUS_KEY = `ops:rollout:${PRODUCTION_ROLLOUT_VERSION}:status`;
const LOCK_KEY = `ops:rollout:${PRODUCTION_ROLLOUT_VERSION}:lock`;
const LOCK_TTL_SECONDS = 30 * 60;
const LOCK_RETRY_MS = 5_000;
const LOCK_MAX_ATTEMPTS = 120;

type RolloutStep = "redis" | "clerk";

export type RolloutStatus = Partial<
  Record<
    RolloutStep,
    {
      completedAt: string;
      deploymentId: string;
      summary: unknown;
    }
  >
>;

export interface RolloutRedis {
  hgetall(key: string): Promise<Record<string, unknown> | null>;
  set(
    key: string,
    value: string,
    options: { nx: true; ex: number }
  ): Promise<string | null>;
  hset(key: string, record: Record<string, unknown>): Promise<number>;
  del(...keys: string[]): Promise<number>;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isProductionRolloutEnvironment(
  env: Readonly<Record<string, string | undefined>>,
  force: boolean
) {
  return force || env.VERCEL_ENV === "production";
}

export async function getProductionRolloutStatus(redis: RolloutRedis) {
  return ((await redis.hgetall(STATUS_KEY)) ?? {}) as RolloutStatus;
}

function isComplete(status: RolloutStatus) {
  return Boolean(status.redis && status.clerk);
}

async function markComplete(
  redis: RolloutRedis,
  step: RolloutStep,
  deploymentId: string,
  summary: unknown,
  now: () => Date
) {
  await redis.hset(STATUS_KEY, {
    [step]: {
      completedAt: now().toISOString(),
      deploymentId,
      summary
    }
  });
}

export async function runProductionRollout({
  redis,
  deploymentId,
  migrateRedis,
  backfillClerk,
  log = console.log,
  now = () => new Date(),
  wait = sleep,
  lockMaxAttempts = LOCK_MAX_ATTEMPTS
}: {
  redis: RolloutRedis;
  deploymentId: string;
  migrateRedis: () => Promise<unknown>;
  backfillClerk: () => Promise<unknown>;
  log?: (message: string) => void;
  now?: () => Date;
  wait?: (ms: number) => Promise<void>;
  lockMaxAttempts?: number;
}) {
  let status = await getProductionRolloutStatus(redis);
  if (isComplete(status)) {
    log(
      `Production rollout ${PRODUCTION_ROLLOUT_VERSION} is already complete.`
    );
    return { status, skipped: true };
  }

  let acquired = false;
  for (let attempt = 0; attempt < lockMaxAttempts; attempt += 1) {
    const lock = await redis.set(LOCK_KEY, deploymentId, {
      nx: true,
      ex: LOCK_TTL_SECONDS
    });
    if (lock === "OK") {
      acquired = true;
      break;
    }

    status = await getProductionRolloutStatus(redis);
    if (isComplete(status)) {
      log(
        `Production rollout ${PRODUCTION_ROLLOUT_VERSION} completed by another deployment.`
      );
      return { status, skipped: true };
    }
    await wait(LOCK_RETRY_MS);
  }

  if (!acquired) {
    throw new Error(
      `Timed out waiting for production rollout ${PRODUCTION_ROLLOUT_VERSION}.`
    );
  }

  try {
    status = await getProductionRolloutStatus(redis);

    if (!status.redis) {
      log("Migrating legacy Redis caches to the v2 hash schema...");
      const summary = await migrateRedis();
      await markComplete(redis, "redis", deploymentId, summary, now);
      status.redis = {
        completedAt: now().toISOString(),
        deploymentId,
        summary
      };
    } else {
      log("Redis v2 migration already completed; skipping.");
    }

    if (!status.clerk) {
      log("Backfilling compact Clerk Roblox metadata...");
      const summary = await backfillClerk();
      await markComplete(redis, "clerk", deploymentId, summary, now);
      status.clerk = {
        completedAt: now().toISOString(),
        deploymentId,
        summary
      };
    } else {
      log("Clerk Roblox metadata backfill already completed; skipping.");
    }

    log(`Production rollout ${PRODUCTION_ROLLOUT_VERSION} completed.`);
    return { status, skipped: false };
  } finally {
    await redis.del(LOCK_KEY);
  }
}
