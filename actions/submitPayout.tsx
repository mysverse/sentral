"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "auth";
import { endpoints } from "components/constants/endpoints";
import { allowedGroups } from "data/sim";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cacheRobloxId,
  getAssetDetailsAndCheckOwnership,
  getPendingRequests,
  getRobloxOauthTokenFromClerkUserId
} from "utils/finsys";
import { extractRobloxIDs } from "utils/roblox";

const allowedGroupNames = allowedGroups.map(
  (g) => g.name
) as [string, ...string[]];

const submitPayoutSchema = z
  .object({
    amount: z.coerce
      .number()
      .int("Amount must be a whole number")
      .min(1, "Amount must be at least 1")
      .max(100, "Amount must be at most 100"),
    reason: z
      .string()
      .min(1, "Reason is required")
      .max(4096, "Reason must be 4096 characters or fewer"),
    sim_agency: z.enum(allowedGroupNames, {
      error: "Invalid agency"
    }),
    sim_reason: z.string().optional(),
    visit_link: z.string().url("Invalid visit link URL").optional(),
    visit_date: z.string().optional(),
    sim_rank_previous: z.string().max(64).optional(),
    sim_rank_after: z.string().max(64).optional(),
    sim_transfer_previous: z.string().max(64).optional(),
    sim_transfer_after: z.string().max(64).optional()
  })
  .refine(
    (data) => {
      if (data.sim_reason?.startsWith("Visit/")) {
        return !!data.visit_link && !!data.visit_date;
      }
      return true;
    },
    {
      message: "Visit link and date are required for visit categories",
      path: ["visit_link"]
    }
  )
  .refine(
    (data) => {
      if (data.visit_date) {
        const today = new Date();
        const selected = new Date(data.visit_date);
        return (
          selected.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
        );
      }
      return true;
    },
    {
      message: "Visit date cannot be in the past",
      path: ["visit_date"]
    }
  );

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

  // Validate form inputs
  const raw = {
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    sim_agency: formData.get("sim_agency"),
    sim_reason: formData.get("sim_reason") || undefined,
    visit_link: formData.get("visit_link") || undefined,
    visit_date: formData.get("visit_date") || undefined,
    sim_rank_previous: formData.get("sim_rank_previous") || undefined,
    sim_rank_after: formData.get("sim_rank_after") || undefined,
    sim_transfer_previous:
      formData.get("sim_transfer_previous") || undefined,
    sim_transfer_after: formData.get("sim_transfer_after") || undefined
  };

  const parsed = submitPayoutSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => i.message).join(", ")
    };
  }

  const {
    amount,
    reason,
    sim_agency,
    sim_reason,
    visit_link,
    visit_date,
    sim_rank_previous,
    sim_rank_after,
    sim_transfer_previous,
    sim_transfer_after
  } = parsed.data;

  // Construct the payload
  const payload = {
    userId: robloxUserId,
    amount,
    reason
  };

  const metadata: string[] = [];

  const robloxIds = extractRobloxIDs(reason);

  if (robloxIds.length === 0) {
    return { error: "Invalid Roblox IDs" };
  }

  const groupData = allowedGroups.find(
    (group) => group.name === sim_agency
  );

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

    const ownershipDataPresent = allAssetDetails?.every(
      (asset) => asset.owned !== undefined
    );

    if (allAssetDetails && ownershipDataPresent) {
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

      if (assetsCost !== payload.amount) {
        errors.push(
          `The total cost of the assets does not match the requested amount. Total calculated cost: **${assetsCost}** / Requested amount: **${payload.amount}**`
        );
      }

      const historicalAssetDetails = allAssetDetails.filter((asset) =>
        previousRobloxIds.includes(asset.id)
      );

      // If there are any unowned assets from approved requests, then add an error saying they have unaccounted funds
      const unownedAssets = historicalAssetDetails.filter(
        (asset) => asset.owned === false && asset.name !== "ERROR"
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
    } else {
      errors.push(
        `Failed to fetch asset ownership data. Please set your Roblox inventory privacy to public.`
      );
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
    `**Agency**: [${sim_agency}](https://roblox.com/communities/${groupData.id})`
  );

  if (sim_reason) {
    metadata.push(`**Category**: ${sim_reason}`);

    if (sim_reason.startsWith("Visit/") && visit_link && visit_date) {
      metadata.push(`**Visit Link**: [${visit_link}](${visit_link})`);
      metadata.push(`**Visit Date**: ${visit_date}`);
    } else if (sim_reason === "Missing") {
      metadata.push(
        `**Note**: Uniform not in in-game equipment module. Please contact Sim agency leadership to request its addition.`
      );
    }
  }

  if (sim_rank_previous && sim_rank_after) {
    metadata.push(`**From/To**: ${sim_rank_previous} > ${sim_rank_after}`);
  }

  if (sim_transfer_previous && sim_transfer_after) {
    metadata.push(
      `**From/To**: ${sim_transfer_previous} > ${sim_transfer_after}`
    );
  }

  if (metadata.length > 0) {
    payload.reason = `${metadata.join("\n")}\n${payload.reason}`;
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
