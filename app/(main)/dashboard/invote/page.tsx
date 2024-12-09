import { getConstituencyData } from "utils/invote";
import ConstituencyList from "./_components/ConstituencyList";
import InvotePage from "./InvoteClient";
import { Suspense } from "react";

export default async function Page() {
  const constituencyData = await getConstituencyData();
  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      <Suspense>
        {constituencyData && <ConstituencyList data={constituencyData} />}
      </Suspense>
      <InvotePage />
    </div>
  );
}
