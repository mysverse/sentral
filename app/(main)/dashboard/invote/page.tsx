import ConstituencyList from "./_components/ConstituencyList";
import InvotePage from "./InvoteClient";
import { Suspense } from "react";
import Spinner from "components/spinner";

import { endpoints } from "components/constants/endpoints";

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

export default async function Page() {
  const seriesIdentifiers = await getInvoteSeriesIdentifiers();
  return (
    <>
      <InvotePage seriesIdentifiers={seriesIdentifiers} />
      <div className="mt-8 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
        <h1 className="mb-2 text-xl font-bold">Candidates</h1>
        <Suspense
          fallback={
            <div className="h-screen">
              <Spinner />
            </div>
          }
        >
          {<ConstituencyList />}
        </Suspense>
      </div>
    </>
  );
}
