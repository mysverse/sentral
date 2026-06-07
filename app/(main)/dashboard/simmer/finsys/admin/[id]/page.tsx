import {
  getPendingRequests,
  getPermissionsOrThrow,
  injectOwnershipAndThumbnailsIntoPayoutRequests
} from "utils/finsys";
import PayoutRequestsTable from "../../_components/PayoutRequestTable";
import { auth } from "auth";

export const metadata = {
  title: "FinSys Admin"
};

type Params = Promise<{ id: string }>;

export default async function Main(props: { params: Params }) {
  const { id } = await props.params;
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }

  let permissions: Awaited<ReturnType<typeof getPermissionsOrThrow>>;
  try {
    permissions = await getPermissionsOrThrow(userId);
  } catch {
    return (
      <div className="container mx-auto px-6 py-6 text-white">
        <p className="text-center">
          Unable to verify permissions. Please try again later.
        </p>
      </div>
    );
  }

  if (permissions.canEdit) {
    const data = await getPendingRequests(id);

    const ownershipData = await injectOwnershipAndThumbnailsIntoPayoutRequests(
      data,
      true
    );

    return (
      <PayoutRequestsTable payoutRequests={ownershipData} adminMode altMode />
    );
  }

  return <>You do not have permissions to edit payout requests.</>;
}
