// import { getLeaderboardData, getMysverseData } from "components/fetcher";
import { auth } from "auth";

import PayoutRequestComponent from "./_components/FinsysPage";
import DefaultTransitionLayout from "components/transition";
import {
  getPendingRequests,
  injectOwnershipAndThumbnailsIntoPayoutRequests
} from "utils/finsys";
import Link from "next/link";

import PayoutRequestsTable from "./_components/PayoutRequestTable";
import { getGroupRoles } from "utils/sim";

export const metadata = {
  title: "FinSys"
};

export default async function Main() {
  const session = await auth();

  if (!session) {
    return null;
  }

  try {
    const [data, groups] = await Promise.all([
      getPendingRequests(session.user.id),
      getGroupRoles(parseInt(session.user.id!))
    ]);

    const ownershipData =
      await injectOwnershipAndThumbnailsIntoPayoutRequests(data);

    // const [leaderboardData, mysverseData] = await Promise.all([
    //   getLeaderboardData(),
    //   getMysverseData(session.user.id)
    // ]);

    // const testId = 31585182;

    return (
      <div>
        <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
          <PayoutRequestComponent groups={groups} />
        </div>
        <h2 className="my-6 text-lg font-medium">Payout Requests</h2>
        <PayoutRequestsTable payoutRequests={ownershipData} />
      </div>
    );
  } catch (error) {
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (errorMessage.match("FINSYS_NOT_ALLOWED")) {
      return (
        <div className="mx-auto max-w-7xl px-3 pb-12 sm:px-6 lg:px-8">
          <DefaultTransitionLayout show={true} appear={true}>
            <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
              <div className="text-medium text-center text-xl">
                <p>{`MYSverse FinSys is only available to selected members of
                MYSverse Sim.`}</p>
                <p>{`If you are already a member of a qualifying Sim Roblox group, please also ensure you have joined the MYSverse Malaysian Community Roblox group.`}</p>
                <p>{`Please read the following guide and ensure you fulfill all the criteria
                for more information: `}</p>
                <Link
                  href="https://dev.mysver.se/finsys-usage-guide/"
                  className="text-blue-600 underline hover:no-underline"
                  target="_blank"
                >
                  https://dev.mysver.se/finsys-usage-guide/
                </Link>
              </div>
            </div>
          </DefaultTransitionLayout>
        </div>
      );
    }
    throw new Error(errorMessage);
  }
}
