import ConstituencyList from "./_components/ConstituencyList";
import InvotePage from "./InvoteClient";
import { Suspense } from "react";
import Spinner from "components/spinner";

import { type SearchParams } from "nuqs/server";

import { endpoints } from "components/constants/endpoints";
import { searchParamsCache } from "utils/searchParams";

async function getInvoteSeriesIdentifiers() {
  const response = await fetch(`${endpoints.invote}/stats/series-identifiers`);

  if (response.ok) {
    const data: string[] = await response.json();
    if (data.find((item) => item === "GE22") === undefined) {
      return ["GE22", ...data];
    }
    return data;
  }

  return [];
}

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function Page(props: PageProps) {
  const seriesIdentifiers = await getInvoteSeriesIdentifiers();
  const { series } = await searchParamsCache.parse(props.searchParams);
  const latestSeries = seriesIdentifiers[0];

  return (
    <>
      <InvotePage seriesIdentifiers={seriesIdentifiers} />
      <div className="mt-8 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <h1 className="mb-4 text-lg font-semibold">Candidates</h1>
        <Suspense
          fallback={
            <div className="h-screen">
              <Spinner />
            </div>
          }
        >
          {<ConstituencyList series={series ?? latestSeries} />}
        </Suspense>
      </div>
    </>
  );
}
