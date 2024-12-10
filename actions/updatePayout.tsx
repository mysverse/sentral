"use server";
import { auth } from "auth";
import { endpoints } from "components/constants/endpoints";
import { revalidatePath } from "next/cache";
import { getPermissions } from "utils/finsys";

export async function updatePayoutRequest(
  requestId: number,
  approved: boolean,
  rejectionReason?: string
) {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) throw new Error("Unauthorized");
  const approverId = parseInt(userId);

  const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;

  if (!session || !apiKey) {
    throw new Error("Unauthorized or missing API key");
  }

  const permissions = await getPermissions(userId);

  if (!permissions.canEdit) {
    return { error: "Unauthorised user" };
  }

  // Construct the payload
  const payload = {
    // userId: session.user.id,
    requestId,
    status: approved ? "approved" : "rejected",
    rejectionReason,
    approverId
  };

  // Call the FinSys API to submit the payout request
  const response = await fetch(`${endpoints.finsys}/update-payout-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  let message = "Failed to update payout request";

  try {
    const json = await response.json();
    const error: string = json.error;
    if (error) {
      message = `${message}: ${error}`;
    }
  } catch (error) {
    console.error(error);
  }

  if (!response.ok) {
    // Handle errors
    return { error: message };
    // throw new Error(message);
  } else {
    // Handle successful submission
    // Optionally, mutate data or revalidate cache here
    revalidatePath("/dashboard/finsys/admin");
    return { message: "Payout request successfully updated!" };
  }
}
