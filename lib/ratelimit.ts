import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";
import { redis } from "./redis";
import { AppError, logAppError, toAppError, toApiError } from "./errors";

function createLimiter(tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `ratelimit:${prefix}`
  });
}

// Game servers submit scores in bursts
export const leaderboardSubmitLimiter = createLimiter(
  30,
  "10 s",
  "leaderboard-submit"
);
export const certIssueLimiter = createLimiter(20, "60 s", "cert-issue");
// PDF generation is CPU-heavy (@react-pdf/renderer) and publicly reachable
export const pdfLimiter = createLimiter(10, "60 s", "cert-pdf");
export const payoutSubmitLimiter = createLimiter(5, "60 s", "payout-submit");

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

// Rate limiting must never take the site down: Redis errors fail open.
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; retryAfterSeconds: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000)
      )
    };
  } catch (error) {
    logAppError(toAppError(error, { service: "ratelimit" }));
    return { success: true, retryAfterSeconds: 0 };
  }
}

// Returns null when allowed, or a ready-made 429 response when limited
export async function enforceRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  const { success, retryAfterSeconds } = await checkRateLimit(
    limiter,
    identifier
  );
  if (success) {
    return null;
  }
  return NextResponse.json(
    toApiError(
      new AppError("Rate limit exceeded", {
        kind: "http",
        status: 429,
        retryable: true,
        publicMessage: "Too many requests. Please try again shortly."
      })
    ),
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}
