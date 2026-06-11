// import { getLeaderboardData, getMysverseData } from "components/fetcher";
import { auth } from "auth";

import PayoutRequestComponent from "./_components/FinsysPage";
import {
  getPendingRequestsResult,
  injectOwnershipAndThumbnailsIntoPayoutRequests
} from "utils/finsys";
import Link from "next/link";

import PayoutRequestsTable from "./_components/PayoutRequestTable";
import { getGroupRoles } from "utils/sim";
import { InlineUnavailable } from "components/errorState";

export const metadata = {
  title: "FinSys"
};

export default async function Main() {
  const session = await auth();

  if (!session) {
    return null;
  }

  // Fetch group roles; fail closed if unavailable
  let groups: Awaited<ReturnType<typeof getGroupRoles>> | undefined;
  let accessError: string | undefined;

  try {
    groups = await getGroupRoles(parseInt(session.user.id!));
  } catch {
    accessError = "Unable to verify group membership. Please try again later.";
  }

  if (accessError) {
    return (
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <div className="text-medium text-center text-xl">
          <p>{accessError}</p>
        </div>
      </div>
    );
  }

  // Fetch pending requests independently
  const requestsResult = await getPendingRequestsResult(session.user.id);

  if (!requestsResult.ok) {
    const err = requestsResult.error;
    if (err.message.match("FINSYS_NOT_ALLOWED")) {
      return (
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <div className="text-medium text-center text-xl">
            <p>{`MYSverse FinSys is only available to selected members of
            MYSverse Sim.`}</p>
            <p>{`If you are already a member of a qualifying Sim Roblox group, please also ensure you have joined the MYSverse Malaysian Community Roblox group.`}</p>
            <p>{`Please read the following guide and ensure you fulfill all the criteria
            for more information: `}</p>
            <Link
              href="https://dev.mysver.se/finsys-usage-guide/"
              className="text-primary-600 underline hover:no-underline"
              target="_blank"
            >
              https://dev.mysver.se/finsys-usage-guide/
            </Link>
          </div>
        </div>
      );
    }

    // Request list failed but access is confirmed — render form with unavailable notice
    return (
      <div>
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <PayoutRequestComponent groups={groups!} />
        </div>
        <h2 className="my-6 text-lg font-medium">Payout Requests</h2>
        <InlineUnavailable label="Your payout requests could not be loaded right now. Please refresh to try again." />
      </div>
    );
  }

  // Enrich with ownership/thumbnails; degrade gracefully if enrichment fails
  let ownershipData: Awaited<
    ReturnType<typeof injectOwnershipAndThumbnailsIntoPayoutRequests>
  >;
  try {
    ownershipData = await injectOwnershipAndThumbnailsIntoPayoutRequests(
      requestsResult.data
    );
  } catch {
    ownershipData = requestsResult.data.map((r) => ({
      ...r,
      ownership: [],
      user: undefined
    }));
  }

  return (
    <div>
      <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
        <PayoutRequestComponent groups={groups!} />
      </div>
      <h2 className="my-6 text-lg font-medium">Payout Requests</h2>
      <PayoutRequestsTable payoutRequests={ownershipData} />
    </div>
  );
}
