"use client";

import {
  ExclamationTriangleIcon,
  ArrowPathIcon
} from "@heroicons/react/20/solid";

interface InlineUnavailableProps {
  label?: string;
}

export function InlineUnavailable({
  label = "This section is temporarily unavailable."
}: InlineUnavailableProps) {
  return (
    <div className="bg-surface-muted text-muted flex items-center gap-2 rounded-md px-4 py-3 text-sm">
      <ExclamationTriangleIcon className="text-muted size-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
}

interface PartialDataNoticeProps {
  label?: string;
}

export function PartialDataNotice({
  label = "Some data could not be loaded and may be incomplete."
}: PartialDataNoticeProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300">
      <ExclamationTriangleIcon className="size-4 shrink-0 text-yellow-500" />
      <span>{label}</span>
    </div>
  );
}

interface RetryHintProps {
  onRetry?: () => void;
  label?: string;
}

export function RetryHint({
  onRetry,
  label = "Failed to load. Please try again."
}: RetryHintProps) {
  return (
    <div className="bg-surface-muted text-muted flex items-center gap-3 rounded-md px-4 py-3 text-sm">
      <ExclamationTriangleIcon className="text-muted size-4 shrink-0" />
      <span>{label}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-auto flex items-center gap-1 rounded-sm"
        >
          <ArrowPathIcon className="size-4" />
          Retry
        </button>
      )}
    </div>
  );
}
