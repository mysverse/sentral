"use server";

import { auth } from "auth";
import { endpoints } from "components/constants/endpoints";
import { revalidatePath } from "next/cache";

export async function submitPayoutRequest(prevState: any, formData: FormData) {
  const session = await auth();
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

  let metadata = ``;

  const agency = formData.get("sim_agency")?.toString().slice(0, 64);
  if (agency) {
    metadata = metadata.concat(`**Agency**: ${agency.toString()}\n`);
  }

  const category = formData.get("sim_reason")?.toString().slice(0, 64);
  if (category) {
    metadata = metadata.concat(`**Category**: ${category.toString()}\n`);
  }

  const rankBefore = formData.get("sim_rank_previous")?.toString().slice(0, 64);
  const rankAfter = formData.get("sim_rank_after")?.toString().slice(0, 64);
  if (rankBefore && rankAfter) {
    metadata = metadata.concat(`**From/To**: ${rankBefore} > ${rankAfter}\n`);
  }

  const transferBefore = formData
    .get("sim_transfer_previous")
    ?.toString()
    .slice(0, 64);
  const transferAfter = formData
    .get("sim_transfer_after")
    ?.toString()
    .slice(0, 64);
  if (transferBefore && transferAfter) {
    metadata = metadata.concat(
      `**From/To**: ${transferBefore} > ${transferAfter}\n`
    );
  }

  if (metadata) {
    payload.reason = `${metadata}\n${payload.reason?.toString().slice(0, 4096)}`;
  }

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
