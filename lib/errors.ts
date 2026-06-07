import { randomUUID } from "crypto";

export type ErrorKind =
  | "network"
  | "timeout"
  | "http"
  | "parse"
  | "validation"
  | "config"
  | "auth"
  | "unknown";

interface AppErrorOptions {
  kind: ErrorKind;
  service?: string;
  status?: number;
  retryable?: boolean;
  publicMessage?: string;
  referenceId?: string;
  attempts?: number;
  cause?: unknown;
}

function defaultPublicMessage(kind: ErrorKind): string {
  switch (kind) {
    case "network":
      return "A network error occurred. Please check your connection.";
    case "timeout":
      return "The request timed out. Please try again.";
    case "http":
      return "The server returned an error. Please try again later.";
    case "parse":
      return "We received an unexpected response. Please try again.";
    case "validation":
      return "The request contained invalid data.";
    case "config":
      return "A configuration error occurred.";
    case "auth":
      return "You are not authorised to perform this action.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export class AppError extends Error {
  kind: ErrorKind;
  service?: string;
  status?: number;
  retryable: boolean;
  publicMessage: string;
  referenceId: string;
  attempts: number;
  override cause?: unknown;

  constructor(message: string, options: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.kind = options.kind;
    this.service = options.service;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
    this.publicMessage =
      options.publicMessage ?? defaultPublicMessage(options.kind);
    this.referenceId = options.referenceId ?? randomUUID().slice(0, 8);
    this.attempts = options.attempts ?? 1;
    this.cause = options.cause;
  }
}

export function toAppError(
  error: unknown,
  defaults: Partial<AppErrorOptions> = {}
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError("Request timed out", {
      kind: "timeout",
      retryable: true,
      publicMessage: "The request timed out. Please try again.",
      ...defaults
    });
  }

  if (
    error instanceof TypeError &&
    (error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch"))
  ) {
    return new AppError(error.message, {
      kind: "network",
      retryable: true,
      ...defaults
    });
  }

  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  return new AppError(message, {
    kind: "unknown",
    retryable: false,
    cause: error,
    ...defaults
  });
}

export function safePublicMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.publicMessage;
  }
  return "An unexpected error occurred. Please try again.";
}

export function toApiError(error: unknown): {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    referenceId: string;
  };
} {
  const appError = toAppError(error);
  return {
    error: {
      code: appError.kind,
      message: appError.publicMessage,
      retryable: appError.retryable,
      referenceId: appError.referenceId
    }
  };
}

interface LogContext {
  route?: string;
  service?: string;
  status?: number;
  duration?: number;
  attempts?: number;
  referenceId?: string;
}

export function logAppError(error: unknown, context: LogContext = {}): void {
  const appError = toAppError(error);
  console.error(
    JSON.stringify({
      level: "error",
      kind: appError.kind,
      message: appError.message,
      service: context.service ?? appError.service,
      status: context.status ?? appError.status,
      route: context.route,
      duration: context.duration,
      attempts: context.attempts ?? appError.attempts,
      referenceId: context.referenceId ?? appError.referenceId
    })
  );
}
