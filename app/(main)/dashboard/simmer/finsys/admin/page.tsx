import {
  getPendingRequests,
  getPermissions,
  injectOwnershipAndThumbnailsIntoPayoutRequests
} from "utils/finsys";
import PayoutRequestsTable from "../_components/PayoutRequestTable";
import { auth } from "auth";

export const metadata = {
  title: "FinSys Admin"
};

export default async function Main() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const permissions = await getPermissions(session.user.id);

  if (permissions.canEdit) {
    const data = (await getPendingRequests()).slice(0, 20);

    const ownershipData = await injectOwnershipAndThumbnailsIntoPayoutRequests(
      data,
      true
    );

    return (
      <div className="container mx-auto p-2">
        <PayoutRequestsTable payoutRequests={ownershipData} adminMode={true} />
      </div>
    );
  }

  return <>Not authorised</>;
}
