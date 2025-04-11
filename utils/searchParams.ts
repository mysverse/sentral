import {
  createSearchParamsCache,
  parseAsIsoDate,
  parseAsString
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const searchParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  series: parseAsString
});

export const dateParamsCache = createSearchParamsCache({
  // List your search param keys and associated parsers here:
  date: parseAsIsoDate
});
