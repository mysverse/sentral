import ConstituencyList from "./_components/ConstituencyList";
import InvotePage from "./InvoteClient";
import { Suspense } from "react";
import Spinner from "components/spinner";
import { Card } from "components/ui/card";

import { type SearchParams } from "nuqs/server";

import { endpoints } from "components/constants/endpoints";
import { searchParamsCache } from "utils/searchParams";
import { readJsonSafe } from "lib/http";

const currentSeries = "GE25";

async function getInvoteSeriesIdentifiers() {
  try {
    const response = await fetch(
      `${endpoints.invote}/stats/series-identifiers`
    );

    if (response.ok) {
      const data = (await readJsonSafe(response)) as string[];
      if (data.find((item) => item === currentSeries) === undefined) {
        return [currentSeries, ...data];
      }
      return data;
    }
  } catch {
    // fall through to default
  }

  return [currentSeries];
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
      <Card className="mt-8">
        <h1 className="text-strong mb-4 text-lg font-semibold">Candidates</h1>
        <Suspense
          fallback={
            <div className="py-32">
              <Spinner />
            </div>
          }
        >
          {<ConstituencyList series={series ?? latestSeries} />}
        </Suspense>
      </Card>
    </>
  );
}
