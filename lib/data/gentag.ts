import "server-only";

import { endpoints } from "components/constants/endpoints";
import type { NametagTemplate } from "components/apiTypes";
import { fetchJsonOrThrow } from "lib/http";
import { cacheLife, cacheTag } from "next/cache";

export async function getNametagTemplates() {
  "use cache";
  cacheLife("metadata");
  cacheTag("gentag:templates");

  if (!endpoints.gentag) {
    return [];
  }

  return fetchJsonOrThrow<NametagTemplate[]>(
    `${endpoints.gentag}/nametag/options`,
    { service: "gentag-templates" }
  );
}
