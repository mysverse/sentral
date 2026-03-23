import type { SearchParams } from "nuqs/server";
import { dateParamsCache } from "utils/searchParams";

import MainClient from "./MainClient";
import type { User } from "./types";

export const metadata = {
  title: "Simetrics"
};

export default async function SimetryPage(props: {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
}) {
  const url = new URL(
    "https://mysverse-webhook-data.yan3321.workers.dev/614134433204797466"
  );

  let { date } = await dateParamsCache.parse(props.searchParams);

  if (!date) {
    date = new Date();
  }

  url.searchParams.set("date", date.toISOString());

  const response = await fetch(url, { next: { revalidate: 60 } });

  const data: User[] = await response.json();

  return <MainClient data={data} key={date.toISOString()} />;
}
