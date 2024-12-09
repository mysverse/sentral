import {
  getPendingRequests,
  getPermissions,
  injectOwnershipAndThumbnailsIntoPayoutRequests
} from "utils/finsys";
import PayoutRequestsTable from "../_components/PayoutRequestTable";
import { auth } from "auth";
import Link from "next/link";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata = {
  title: "FinSys Admin"
};

export default async function Main(props: { searchParams: SearchParams }) {
  const session = await auth();
  const userId = session?.user.id;
  const searchParams = await props.searchParams;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const permissions = await getPermissions(userId);

  const PAGE_SIZE = 10;

  const page =
    searchParams.page && typeof searchParams.page === "string"
      ? parseInt(searchParams.page)
      : 1;

  if (permissions.canEdit) {
    const limit = PAGE_SIZE;
    const offset = (page - 1) * PAGE_SIZE;
    const data = await getPendingRequests(undefined, limit, offset);
    const ownershipData = await injectOwnershipAndThumbnailsIntoPayoutRequests(
      data,
      true
    );

    return (
      <>
        <div className="container mx-auto grid grid-cols-1 px-6 pb-3 text-white sm:grid-cols-3">
          <p className="text-center sm:text-left">
            Showing <b>{data.length}</b> requests
          </p>
          <p className="text-center">
            Page <b>{page}</b>
          </p>
          <div className="flex flex-row items-center justify-center space-x-4 sm:justify-end">
            {page > 1 && (
              <Link
                href={`/dashboard/simmer/finsys/admin?page=${page - 1}`}
                className="transition hover:opacity-50"
              >
                Previous
              </Link>
            )}
            <Link
              href={`/dashboard/simmer/finsys/admin?page=${page + 1}`}
              className="transition hover:opacity-50"
            >
              Next
            </Link>
          </div>
        </div>
        <PayoutRequestsTable payoutRequests={ownershipData} adminMode />
      </>
    );
  }

  return <>Not authorised</>;
}
