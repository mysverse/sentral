import ConstituencyList from "./_components/ConstituencyList";
import InvotePage from "./InvoteClient";
import { Suspense } from "react";
import Spinner from "components/spinner";
import { Card } from "components/ui/card";

import { type SearchParams } from "nuqs/server";

import { searchParamsCache } from "utils/searchParams";
import {
  getInvoteSeatStats,
  getInvoteSeries,
  getInvoteStats
} from "lib/data/invote";
import SWRFallback from "components/SWRFallback";
import { invoteSeatsKey, invoteStatsKey } from "lib/readKeys";

const currentSeries = "GE25";

async function getInvoteSeriesIdentifiers() {
  try {
    const data = await getInvoteSeries();
    if (data.find((item) => item === currentSeries) === undefined) {
      return [currentSeries, ...data];
    }
    return data;
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
  const selectedSeries = series ?? latestSeries;
  const [stats, seats] = await Promise.all([
    getInvoteStats(selectedSeries),
    getInvoteSeatStats(selectedSeries)
  ]);
  const statsKey = invoteStatsKey(selectedSeries);
  const seatsKey = invoteSeatsKey(selectedSeries);

  return (
    <>
      <SWRFallback fallback={{ [statsKey]: stats, [seatsKey]: seats }}>
        <InvotePage seriesIdentifiers={seriesIdentifiers} />
      </SWRFallback>
      <Card className="mt-8">
        <h1 className="text-strong mb-4 text-lg font-semibold">Candidates</h1>
        <Suspense
          fallback={
            <div className="py-32">
              <Spinner />
            </div>
          }
        >
          {<ConstituencyList series={selectedSeries} />}
        </Suspense>
      </Card>
    </>
  );
}
