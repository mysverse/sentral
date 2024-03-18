import { PendingPayoutRequestsResponse } from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";

const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;

export async function getPendingRequests(userId?: string) {
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

  if (res.ok) {
    const data: PendingPayoutRequestsResponse = await res.json();

    // console.log(data);

    return data.requests;
  }

  const data = await res.json();
  throw new Error(data.error);
}

interface FinsysPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

export async function getPermissions(userId: string) {
  if (!apiKey) {
    throw new Error("Missing API key for FinSys");
  }

  const url = new URL(`${endpoints.finsys}/permissions`);

  url.searchParams.set("userId", userId);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    }
  });

  if (res.ok) {
    const data: FinsysPermissions = await res.json();
    // console.log(data);
    return data;
  }

  const data = await res.json();
  throw new Error(data.error);
}
