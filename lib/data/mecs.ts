import "server-only";

import { endpoints } from "components/constants/endpoints";
import { fetchJsonOrThrow } from "lib/http";
import { cacheLife, cacheTag } from "next/cache";

async function fetchMecs(path: string) {
  if (!endpoints.mecs) {
    throw new Error("The MECS API is not configured.");
  }
  return fetchJsonOrThrow<unknown>(
    `${endpoints.mecs.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    { service: "mecs" }
  );
}

export async function getMecsStaff() {
  "use cache";
  cacheLife("dashboard");
  cacheTag("mecs:staff");
  if (!endpoints.mecs) {
    return [];
  }
  return fetchMecs("audit/staff");
}

export async function getMecsCaseStats() {
  "use cache";
  cacheLife("dashboard");
  cacheTag("mecs:case-stats");
  if (!endpoints.mecs) {
    return [];
  }
  return fetchMecs("stats/case");
}

export async function getMecsAuditStats() {
  "use cache";
  cacheLife("dashboard");
  cacheTag("mecs:audit-stats");
  if (!endpoints.mecs) {
    return null;
  }
  return fetchMecs("audit/accuracy");
}

export async function getMecsBlacklist() {
  "use cache";
  cacheLife("dashboard");
  cacheTag("mecs:blacklist");
  return fetchJsonOrThrow<unknown>(
    "https://mysverse-blacklist.yan3321.workers.dev/new",
    { service: "blacklist" }
  );
}

export async function getMecsUser(query: string, treatAsUserId: boolean) {
  "use cache";
  cacheLife({
    stale: 60,
    revalidate: 5 * 60,
    expire: 30 * 60
  });
  cacheTag(`mecs:user:${treatAsUserId ? "id" : "name"}:${query}`);

  if (!endpoints.mecs) {
    throw new Error("The MECS API is not configured.");
  }
  const url = new URL(
    `${endpoints.mecs.replace(/\/$/, "")}/user/${encodeURIComponent(query)}`
  );
  url.searchParams.set("paramType", treatAsUserId ? "id" : "name");
  return fetchJsonOrThrow<unknown>(url, { service: "mecs-user" });
}
