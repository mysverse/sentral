"use client";

import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/20/solid";

interface InlineUnavailableProps {
  label?: string;
}

export function InlineUnavailable({
  label = "This section is temporarily unavailable."
}: InlineUnavailableProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-500">
      <ExclamationTriangleIcon className="size-4 shrink-0 text-gray-400" />
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
    <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
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
    <div className="flex items-center gap-3 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-500">
      <ExclamationTriangleIcon className="size-4 shrink-0 text-gray-400" />
      <span>{label}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto flex items-center gap-1 rounded-sm text-blue-600 hover:text-blue-500"
        >
          <ArrowPathIcon className="size-4" />
          Retry
        </button>
      )}
    </div>
  );
}
