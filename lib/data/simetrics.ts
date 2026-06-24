import "server-only";

import { fetchJsonOrThrow } from "lib/http";
import { cacheLife, cacheTag } from "next/cache";

const endpoint =
  "https://mysverse-webhook-data.yan3321.workers.dev/614134433204797466";

async function fetchSimetrics(dateIso: string) {
  const url = new URL(endpoint);
  url.searchParams.set("date", dateIso);
  return fetchJsonOrThrow<unknown>(url, { service: "simetrics" });
}

export async function getCurrentSimetrics(dateIso: string) {
  "use cache";
  cacheLife("rapid");
  cacheTag(`simetrics:${dateIso.slice(0, 10)}`);
  return fetchSimetrics(dateIso);
}

export async function getHistoricalSimetrics(dateIso: string) {
  "use cache";
  cacheLife("historical");
  cacheTag(`simetrics:${dateIso.slice(0, 10)}`);
  return fetchSimetrics(dateIso);
}
