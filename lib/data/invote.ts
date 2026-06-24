import "server-only";

import { endpoints } from "components/constants/endpoints";
import { fetchJsonOrThrow } from "lib/http";
import { cacheLife, cacheTag } from "next/cache";

export async function getInvoteSeries() {
  "use cache";
  cacheLife("metadata");
  cacheTag("invote:series");
  if (!endpoints.invote) {
    return [];
  }
  return fetchJsonOrThrow<string[]>(
    `${endpoints.invote}/stats/series-identifiers`,
    { service: "invote-series" }
  );
}

export async function getInvoteStats(series: string) {
  "use cache";
  cacheLife("live");
  cacheTag(`invote:stats:${series}`);
  if (!endpoints.invote) {
    return [];
  }
  return fetchJsonOrThrow<unknown>(
    `${endpoints.invote}/stats/timestamp?series_identifier=${encodeURIComponent(series)}`,
    { service: "invote-stats" }
  );
}

export async function getInvoteSeatStats(series: string) {
  "use cache";
  cacheLife("live");
  cacheTag(`invote:seats:${series}`);
  if (!endpoints.invote) {
    return [];
  }
  return fetchJsonOrThrow<unknown>(
    `${endpoints.invote}/stats/seats/${encodeURIComponent(series)}`,
    { service: "invote-seats" }
  );
}

export async function getInvoteCandidates(series: string) {
  "use cache";
  cacheLife("metadata");
  cacheTag(`invote:candidates:${series}`);
  const url = new URL("https://mysverse-election.yan3321.workers.dev/");
  url.pathname += encodeURIComponent(series);
  return fetchJsonOrThrow<unknown>(url, { service: "invote-candidates" });
}
