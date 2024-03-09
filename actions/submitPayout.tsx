"use server";

import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import { endpoints } from "components/constants/endpoints";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function submitPayoutRequest(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;

  if (!session || !apiKey) {
    throw new Error("Unauthorized or missing API key");
  }
  // Construct the payload
  const payload = {
    userId: session.user.id,
    amount: formData.get("amount"),
    reason: formData.get("reason")
  };

  // Call the FinSys API to submit the payout request
  const response = await fetch(`${endpoints.finsys}/create-payout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  let message = "Failed to submit payout request";

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
    revalidatePath("/dashboard/finsys");
    return { message: "ok" };
  }
}
