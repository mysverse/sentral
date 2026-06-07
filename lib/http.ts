import { AppError, logAppError, toAppError } from "./errors";

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

export const DEFAULT_TIMEOUT = 8_000;
export const FINSYS_PENDING_TIMEOUT = 10_000;
export const THUMBNAIL_TIMEOUT = 5_000;

// Extends RequestInit with Next.js-specific cache options
export interface FetchOptions extends Omit<RequestInit, "signal"> {
  timeout?: number;
  maxAttempts?: number;
  service?: string;
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
}

export async function readJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || !text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("Response body could not be parsed as JSON", {
      kind: "parse",
      retryable: false
    });
  }
}

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

function isNonRetryable(status: number): boolean {
  return NON_RETRYABLE_STATUSES.has(status);
}

function getRetryDelay(
  attempt: number,
  retryAfterHeader?: string | null
): number {
  if (retryAfterHeader) {
    const retryAfterSec = parseInt(retryAfterHeader, 10);
    if (!isNaN(retryAfterSec)) {
      return Math.min(retryAfterSec * 1000, 30_000);
    }
  }
  const base = Math.min(200 * Math.pow(2, attempt - 1), 5_000);
  const jitter = Math.random() * 200;
  return base + jitter;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string | URL,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    maxAttempts = 3,
    service,
    ...fetchOptions
  } = options;

  const method = fetchOptions.method?.toUpperCase() ?? "GET";
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);

  let lastError: AppError | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Non-retryable HTTP status or unsafe mutation — fail immediately
      if (isNonRetryable(response.status) || isMutation) {
        const body = await readJsonSafe(response).catch(() => null);
        throw new AppError(
          `HTTP ${response.status} from ${service ?? String(url)}`,
          {
            kind:
              response.status === 401 || response.status === 403
                ? "auth"
                : "http",
            service,
            status: response.status,
            retryable: false,
            cause: body
          }
        );
      }

      if (isRetryable(response.status) && attempt < maxAttempts) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = getRetryDelay(attempt, retryAfter);
        lastError = new AppError(
          `HTTP ${response.status} from ${service ?? String(url)}`,
          {
            kind: "http",
            service,
            status: response.status,
            retryable: true,
            attempts: attempt
          }
        );
        await sleep(delay);
        continue;
      }

      const body = await readJsonSafe(response).catch(() => null);
      throw new AppError(
        `HTTP ${response.status} from ${service ?? String(url)}`,
        {
          kind: "http",
          service,
          status: response.status,
          retryable: isRetryable(response.status),
          attempts: attempt,
          cause: body
        }
      );
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof AppError) {
        throw error;
      }

      const appError = toAppError(error, { service });

      if (
        (appError.kind === "timeout" || appError.kind === "network") &&
        !isMutation &&
        attempt < maxAttempts
      ) {
        const delay = getRetryDelay(attempt);
        lastError = appError;
        await sleep(delay);
        continue;
      }

      throw appError;
    }
  }

  throw (
    lastError ??
    new AppError("Max retries exceeded", {
      kind: "network",
      service,
      retryable: true
    })
  );
}

export type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export async function fetchJsonResult<T>(
  url: string | URL,
  options: FetchOptions = {}
): Promise<FetchJsonResult<T>> {
  try {
    const response = await fetchWithRetry(url, options);
    const data = await readJsonSafe(response);
    return { ok: true, data: data as T };
  } catch (error) {
    const appError = toAppError(error, { service: options.service });
    logAppError(appError, { service: options.service });
    return { ok: false, error: appError };
  }
}

export async function fetchJsonOrThrow<T>(
  url: string | URL,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  const data = await readJsonSafe(response);
  return data as T;
}
