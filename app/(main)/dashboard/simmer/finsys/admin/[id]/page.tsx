import {
  getPendingRequests,
  getPermissions,
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

  const permissions = await getPermissions(userId);

  if (permissions.canEdit) {
    const data = await getPendingRequests(id);

    const ownershipData = await injectOwnershipAndThumbnailsIntoPayoutRequests(
      data,
      true
    );

    return (
      <div className="container mx-auto p-2">
        <PayoutRequestsTable payoutRequests={ownershipData} adminMode altMode />
      </div>
    );
  }

  return <>You do not have permissions to edit payout requests.</>;
}
