import {
  PayoutRequestData,
  PendingPayoutRequestsResponse
} from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";

const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;

type ItemDetail = {
  id: number;
  itemType: string;
  name: string;
  price: number;
  creatorTargetId: number;
  creatorName: string;
};

type AssetDetailsRequest = {
  items: Array<{ itemType: number; id: number }>;
};

type AssetDetailResponse = {
  data: Array<{
    id: number;
    itemType: string;
    assetType: number;
    name: string;
    description: string;
    productId: number;
    itemStatus: any[];
    itemRestrictions: any[];
    creatorHasVerifiedBadge: boolean;
    creatorType: string;
    creatorTargetId: number;
    creatorName: string;
    price: number;
    purchaseCount: number;
    favoriteCount: number;
    offSaleDeadline: string | null;
    saleLocationType: string;
  }>;
};

type InventoryItemResponse = {
  inventoryItems: Array<{
    assetDetails: {
      assetId: string;
    };
  }>;
};

let csrf: string | null = null;

const regex = /https:\/\/(?:www\.)?roblox\.com\/catalog\/(\d+)\/[\w-]+/g;

export function extractRobloxIDs(text: string): number[] {
  const ids: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    ids.push(match[1]); // match[1] contains the captured numeric ID
  }

  return Array.from(new Set(ids)).map((id) => parseInt(id)); // Remove duplicates
}

async function getCsrfToken() {
  const url = "https://catalog.roblox.com/v1/catalog/items/details";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json"
    }
  });

  const token = response.headers.get("x-csrf-token");

  if (token) {
    csrf = token;
  } else {
    throw new Error("Did not recieve CSRF token");
  }
}

// Function to fetch asset details from the catalog
async function fetchAssetDetails(assetIds: number[]): Promise<ItemDetail[]> {
  const url = "https://maps2.yan3321.workers.dev";
  const body: AssetDetailsRequest = {
    items: assetIds.map((id) => ({ itemType: 1, id }))
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error(await response.json());
    throw new Error(`Failed to fetch asset details: ${response.statusText}`);
  }

  const data: AssetDetailResponse = await response.json();

  return data.data.map((item) => ({
    id: item.id,
    itemType: item.itemType,
    name: item.name,
    price: item.price,
    creatorTargetId: item.creatorTargetId,
    creatorName: item.creatorName
  }));
}

interface OwnershipResponse {
  id: number;
  owned: boolean;
}

interface RobloxThumbnailAssetApiResponse {
  data: {
    targetId: number;
    state: string;
    imageUrl: string;
    version: string;
  }[];
}

async function fetchThumbnails(assetIds: number[]) {
  await getCsrfToken();
  if (csrf) {
    const url = `https://thumbnails.roblox.com/v1/assets`;

    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      const response = await fetch(
        `https://myx-proxy.yan3321.workers.dev/myxProxy/?apiurl=${encodeURIComponent(
          `${url}?assetIds=${assetIds.join(",")}&format=Png&isCircular=false&size=420x420`
        )}`,
        {
          method: "GET",
          headers: {
            "x-csrf-token": csrf
          }
        }
      );

      if (response.ok) {
        const data: RobloxThumbnailAssetApiResponse = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        console.error(errorData);
      }
      retries++;
    }
  }

  throw new Error(`Failed to fetch asset thumbnails`);
}

const ownershipDisabled = true;

// Function to check if a user owns a specific asset
async function checkUserOwnership(
  userId: string,
  assetIds: number[],
  token?: string
): Promise<OwnershipResponse[]> {
  if (ownershipDisabled) {
    return assetIds.map((id) => ({
      id,
      owned: false
    }));
  }

  try {
    await getCsrfToken();
    if (csrf) {
      const url = `https://apis.roblox.com/cloud/v2/users/${userId}/inventory-items`;

      const response = await fetch(
        `${url}?filter=assetIds=${assetIds.join(",")}`,
        {
          method: "GET",
          headers: {
            "x-csrf-token": csrf,
            authorization: `Bearer ${token}` // Replace with your API key
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData);
        if (errorData?.code === "PERMISSION_DENIED") {
          // need to grant perms
          throw new Error("PERMISSION_DENIED");
        }
        throw new Error(
          `Failed to fetch user inventory: ${response.statusText}`
        );
      }

      const data: InventoryItemResponse = await response.json();

      return assetIds.map((id) => ({
        id,
        owned: data.inventoryItems.some(
          (item) => parseInt(item.assetDetails.assetId) === id
        )
      }));
    }

    throw new Error(`Failed to fetch user inventory: CSRF`);
  } catch {
    return assetIds.map((id) => ({
      id,
      owned: false
    }));
  }
}

// Main function to get asset details and check ownership
export async function getAssetDetailsAndCheckOwnership(
  userId: string,
  assetIds: number[],
  token?: string
) {
  try {
    // Fetch the asset details
    const [thumbnails, assets, isOwned] = await Promise.all([
      fetchThumbnails(assetIds),
      fetchAssetDetails(assetIds),
      checkUserOwnership(userId, assetIds, token)
    ]);

    return assets.map((asset) => ({
      ...asset,
      owned: isOwned.find((item) => item.id === asset.id)?.owned,
      thumbnail: thumbnails.data.find((thumb) => thumb.targetId === asset.id)
        ?.imageUrl
    }));
  } catch (error) {
    console.error("E:", error);
  }
}

export async function injectOwnershipAndThumbnailsIntoPayoutRequests(
  requests: PayoutRequestData[]
) {
  // Extract all unique asset IDs and user IDs from the payout requests
  const assetIds = Array.from(
    new Set(requests.flatMap((request) => extractRobloxIDs(request.reason)))
  );
  const userIds = Array.from(
    new Set(requests.map((request) => request.user_id.toString()))
  );

  // Create maps to store the ownership, thumbnail, and asset data results
  const ownershipMap = new Map<string, Map<number, boolean>>();
  const thumbnailMap = new Map<number, string>();
  const assetDataMap = new Map<number, ItemDetail>();

  // Check ownership for each user ID with the unique asset IDs concurrently
  const ownershipPromises = userIds.map(async (userId) => {
    const ownership = await checkUserOwnership(userId, assetIds);
    const userOwnershipMap = new Map<number, boolean>();
    ownership.forEach((item) => {
      userOwnershipMap.set(item.id, item.owned);
    });
    return { userId, userOwnershipMap };
  });

  const [ownershipResults, thumbnails, assetData] = await Promise.all([
    Promise.all(ownershipPromises),
    fetchThumbnails(assetIds).catch(() => undefined),
    fetchAssetDetails(assetIds).catch(() => undefined)
  ]);

  ownershipResults.forEach(({ userId, userOwnershipMap }) => {
    ownershipMap.set(userId, userOwnershipMap);
  });

  if (thumbnails)
    thumbnails.data.forEach((item) => {
      thumbnailMap.set(item.targetId, item.imageUrl);
    });

  if (assetData)
    assetData.forEach((item) => {
      assetDataMap.set(item.id, item);
    });

  // Iterate over the payout requests and inject the ownership, thumbnail, and asset data information using the maps
  return requests.map((request) => {
    const assets = extractRobloxIDs(request.reason);
    const userOwnershipMap =
      ownershipMap.get(request.user_id.toString()) || new Map();
    const ownedAssets = assets.map((id) => ({
      id,
      owned: userOwnershipMap.get(id) || false,
      thumbnail: thumbnailMap.get(id) || undefined,
      assetData: assetDataMap.get(id) || undefined
    }));
    return {
      ...request,
      ownership: ownedAssets
    };
  });
}

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

    data.requests.sort((a, b) => {
      // First, prioritize pending requests
      if (a.status === "pending" && b.status !== "pending") {
        return -1;
      } else if (a.status !== "pending" && b.status === "pending") {
        return 1;
      }
      // Then, within the same status, sort by created_at in descending order
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
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
    return data;
  }

  const data = await res.json();
  throw new Error(data.error);
}
