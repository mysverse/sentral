"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "auth";
import { endpoints } from "components/constants/endpoints";
import { allowedGroups } from "data/sim";
import { revalidatePath } from "next/cache";

import {
  cacheRobloxId,
  getAssetDetailsAndCheckOwnership,
  getPendingRequests,
  getRobloxOauthTokenFromClerkUserId
} from "utils/finsys";
import { extractRobloxIDs } from "utils/roblox";

export async function submitPayoutRequest(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user.id) throw new Error("Unauthorized");

  const robloxUserId = parseInt(session.user.id);
  const clerkId = session.user.clerkId;

  await cacheRobloxId(robloxUserId, clerkId);

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

  const metadata: string[] = [];

  if (!payload.amount || !payload.reason) {
    return { error: "Invalid amount or reason" };
  }

  const robloxIds = extractRobloxIDs(payload.reason.toString());

  if (robloxIds.length === 0) {
    return { error: "Invalid Roblox IDs" };
  }

  const agency = formData.get("sim_agency")?.toString().slice(0, 64);

  if (!agency) {
    return { error: "Invalid agency" };
  }

  const groupData = allowedGroups.find((group) => group.name === agency);

  if (!groupData) {
    return { error: "Invalid group data" };
  }

  const validOwnerIds: number[] = [groupData.id].concat(
    groupData.approvedGroupIds || []
  );

  // Request validation start

  const errors: string[] = [];

  try {
    const client = await clerkClient();

    const [pendingRequests, oauthToken] = await Promise.all([
      getPendingRequests(robloxUserId),
      getRobloxOauthTokenFromClerkUserId(client, clerkId, robloxUserId)
    ]);

    const approvedRequests = pendingRequests.filter(
      (request) => request.status === "approved"
    );

    const previousRobloxIds = Array.from(
      new Set(
        approvedRequests.flatMap((request) => extractRobloxIDs(request.reason))
      )
    );

    const totalRobloxIds = Array.from(
      new Set([...robloxIds, ...previousRobloxIds])
    );

    const allAssetDetails = await getAssetDetailsAndCheckOwnership(
      robloxUserId.toString(),
      totalRobloxIds,
      oauthToken ?? undefined
    );

    if (allAssetDetails) {
      const assetDetails = allAssetDetails.filter((asset) =>
        robloxIds.includes(asset.id)
      );

      const invalidOwnerAssets = assetDetails.filter(
        (asset) => !validOwnerIds.includes(asset.creatorTargetId)
      );

      const ownedAssets = assetDetails.filter((asset) => asset.owned);

      const assetsCost = assetDetails.reduce(
        (acc, asset) => acc + asset.price,
        0
      );

      if (invalidOwnerAssets.length > 0) {
        errors.push(
          `The asset(s) ${invalidOwnerAssets
            .map(
              (asset) =>
                `**[${asset.name}](https://roblox.com/catalog/${asset.id})**`
            )
            .join(", ")} are not owned by the selected agency.`
        );
      }

      if (ownedAssets.length > 0) {
        errors.push(
          `The asset(s) ${ownedAssets
            .map(
              (asset) =>
                `**[${asset.name}](https://roblox.com/catalog/${asset.id})**`
            )
            .join(", ")} are already owned.`
        );
      }

      if (assetsCost !== parseInt(payload.amount.toString())) {
        errors.push(
          `The total cost of the assets does not match the requested amount. Total calculated cost: **${assetsCost}** / Requested amount: **${payload.amount}**`
        );
      }

      const historicalAssetDetails = allAssetDetails.filter((asset) =>
        previousRobloxIds.includes(asset.id)
      );

      // If there are any unowned assets from approved requests, then add an error saying they have unaccounted funds
      const unownedAssets = historicalAssetDetails.filter(
        (asset) => !asset.owned
      );

      if (unownedAssets.length > 0) {
        errors.push(
          `The asset(s) ${unownedAssets
            .map(
              (asset) =>
                `**[${asset.name}](https://roblox.com/catalog/${asset.id})**`
            )
            .join(", ")} from previous requests are not owned.`
        );
      }
    }
  } catch (error) {
    console.error(`Failed to validate payout request by ${robloxUserId}`);
    console.error(error);
  }

  const valid = errors.length === 0;

  if (!valid) {
    return {
      error: "Failed to validate payout request",
      validationErrors: errors
    };
  }

  // Request validation end

  metadata.push(
    `**Agency**: [${agency.toString()}](https://roblox.com/communities/${groupData.id})`
  );

  const category = formData.get("sim_reason")?.toString().slice(0, 64);
  if (category) {
    metadata.push(`**Category**: ${category.toString()}`);
  }

  const rankBefore = formData.get("sim_rank_previous")?.toString().slice(0, 64);
  const rankAfter = formData.get("sim_rank_after")?.toString().slice(0, 64);
  if (rankBefore && rankAfter) {
    metadata.push(`**From/To**: ${rankBefore} > ${rankAfter}`);
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
    metadata.push(`**From/To**: ${transferBefore} > ${transferAfter}`);
  }

  if (metadata.length > 0) {
    payload.reason = `${metadata.join("\n")}\n${payload.reason?.toString().slice(0, 4096)}`;
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
  let requestId: number | undefined;

  try {
    interface CreatePayoutResponse {
      id?: number;
      message?: string;
      error?: string;
    }
    const json: CreatePayoutResponse = await response.json();
    if (json.id) {
      requestId = json.id as number;
    }
    const error = json.error;
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
    revalidatePath("/dashboard/simmer/finsys");
    return { message: `Payout request ${requestId} successfully submitted!` };
  }
}
