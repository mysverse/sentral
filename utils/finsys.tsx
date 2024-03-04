import { PendingPayoutRequestsResponse } from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";

export async function getPendingRequests(userId?: string) {
  const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing API key for FinSys");
  }

  const url = new URL(`${endpoints.finsys}/pending-requests`);

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    }
  });

  const data: PendingPayoutRequestsResponse = await res.json();

  // console.log(data);

  return data.requests;
}
