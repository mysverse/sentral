import type { SearchParams } from "nuqs/server";
import { dateParamsCache } from "utils/searchParams";

import MainClient from "./MainClient";
import type { User } from "./types";
import {
  getCurrentSimetrics,
  getHistoricalSimetrics
} from "lib/data/simetrics";
import { simetricsCacheProfile } from "lib/cachePolicy";

export const metadata = {
  title: "Simetrics"
};

export default async function SimetryPage(props: {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
}) {
  let { date } = await dateParamsCache.parse(props.searchParams);

  if (!date) {
    date = new Date();
  }

  const dateIso = date.toISOString();
  const profile = simetricsCacheProfile(dateIso, new Date().toISOString());
  const data = (await (profile === "rapid"
    ? getCurrentSimetrics(dateIso)
    : getHistoricalSimetrics(dateIso))) as User[];

  return <MainClient data={data} key={date.toISOString()} />;
}
