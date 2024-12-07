import {
  PayoutRequestData,
  PendingPayoutRequestsResponse
} from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";
import { extractRobloxIDs } from "./roblox";
import { redis } from "lib/redis";

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

function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ROBLOSECURITY = process.env.ROBLOSECURITY;

// Function to fetch asset details from the catalog
async function fetchAssetDetails(assetIds: number[]): Promise<ItemDetail[]> {
  // Replace individual redis.get with mget
  const assetKeys = assetIds.map((id) => `asset:${id}`);
  const assetData = await redis.mget<(ItemDetail | "None")[]>(...assetKeys);

  if (assetData.every((item) => item !== "None")) {
    console.log("All assets found in cache");
    return assetData;
  }

  if (assetIds.length === 0) {
    return [];
  }

  let retries = 0;
  const maxRetries = 3;

  let csrf = await redis.get<string>("x-csrf-token");

  while (retries < maxRetries) {
    const url = "https://catalog.roblox.com/v1/catalog/items/details";
    const body: AssetDetailsRequest = {
      items: assetIds.map((id) => ({ itemType: 1, id }))
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "application/json"
    };

    if (csrf) {
      headers["x-csrf-token"] = csrf;
    }

    if (ROBLOSECURITY) headers["cookie"] = `.ROBLOSECURITY=${ROBLOSECURITY}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "force-cache"
    });

    if (!response.ok) {
      console.error(await response.json());
      const responseCsrf = response.headers.get("x-csrf-token");
      if (!csrf && responseCsrf) {
        csrf = responseCsrf;
        continue;
      } else {
        retries++;
        await timeout(1000);
        continue;
      }
    }

    const data: AssetDetailResponse = await response.json();

    const returnData = data.data.map((item) => ({
      id: item.id,
      itemType: item.itemType,
      name: item.name,
      price: item.price,
      creatorTargetId: item.creatorTargetId,
      creatorName: item.creatorName
    }));

    // Replace individual redis.set with mset
    const assetDataToCache: Record<string, string> = {};
    returnData.forEach((item) => {
      assetDataToCache[`asset:${item.id}`] = JSON.stringify(item);
    });
    await redis.mset(assetDataToCache);

    return returnData;
  }

  throw new Error("Unable to get CSRF token while fetching asset details");
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

async function fetchUserData(userIds: number[]) {
  interface RobloxUser {
    hasVerifiedBadge: boolean;
    id: number;
    name: string;
    displayName: string;
  }
  interface RobloxUserResponse {
    data: RobloxUser[];
  }

  // Replace individual redis.get with mget
  const userKeys = userIds.map((id) => `user:${id}`);
  const userData = await redis.mget<(RobloxUser | "None")[]>(...userKeys);
  console.log(userData);
  if (userData.every((item) => item !== "None")) {
    console.log("All users found in cache");
    return { data: userData };
  }

  const response = await fetch(`https://users.roblox.com/v1/users`, {
    method: "POST",
    // cache: "force-cache",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ userIds, excludeBannedUsers: true }),
    next: { revalidate: 5 * 60 }
  });

  const data: RobloxUserResponse = await response.json();

  // Replace individual redis.set with mset
  const userDataToCache: Record<string, string> = {};
  data.data.forEach((item) => {
    userDataToCache[`user:${item.id}`] = JSON.stringify(item);
  });
  await redis.mset(userDataToCache);

  return data;
}

async function fetchThumbnails(assetIds: number[]) {
  let retries = 0;
  const maxRetries = 3;

  type ThumbnailData = RobloxThumbnailAssetApiResponse["data"][number];

  // Replace individual redis.get with mget
  const thumbnailKeys = assetIds.map((id) => `thumbnail:${id}`);
  const thumbnailData = await redis.mget<(ThumbnailData | "None")[]>(
    ...thumbnailKeys
  );
  if (thumbnailData.every((item) => item !== "None")) {
    console.log("All thumbnails found in cache");
    return { data: thumbnailData };
  }

  if (assetIds.length === 0) {
    return { data: [] };
  }

  while (retries < maxRetries) {
    const url = `https://thumbnails.roblox.com/v1/assets`;

    const response = await fetch(
      `https://myx-proxy.yan3321.workers.dev/myxProxy/?apiurl=${encodeURIComponent(
        `${url}?assetIds=${assetIds.join(",")}&format=Png&isCircular=false&size=420x420`
      )}`,
      {
        method: "GET",
        // cache: "force-cache",
        next: { revalidate: 5 * 60 }
      }
    );

    if (response.ok) {
      const data: RobloxThumbnailAssetApiResponse = await response.json();
      // Replace individual redis.set with mset
      const thumbnailDataToCache: Record<string, string> = {};
      data.data.forEach((item) => {
        thumbnailDataToCache[`thumbnail:${item.targetId}`] =
          JSON.stringify(item);
      });
      await redis.mset(thumbnailDataToCache);
      return data;
    } else {
      const errorData = await response.json();
      console.error(errorData);
    }
    await timeout(1000);
    retries++;
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
    const url = `https://apis.roblox.com/cloud/v2/users/${userId}/inventory-items`;

    const response = await fetch(
      `${url}?filter=assetIds=${assetIds.join(",")}`,
      {
        method: "GET",
        headers: {
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
      throw new Error(`Failed to fetch user inventory: ${response.statusText}`);
    }

    const data: InventoryItemResponse = await response.json();

    return assetIds.map((id) => ({
      id,
      owned: data.inventoryItems.some(
        (item) => parseInt(item.assetDetails.assetId) === id
      )
    }));

    // throw new Error(`Failed to fetch user inventory: CSRF`);
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
  requests: PayoutRequestData[],
  adminMode = false
) {
  // Extract all unique asset IDs and user IDs from the payout requests
  const assetIds = Array.from(
    new Set(requests.flatMap((request) => extractRobloxIDs(request.reason)))
  ).sort((a, b) => a - b);
  const userIds = Array.from(
    new Set(requests.map((request) => request.user_id))
  ).sort((a, b) => a - b);

  // Create maps to store the ownership, thumbnail, and asset data results
  const ownershipMap = new Map<number, Map<number, boolean>>();
  const thumbnailMap = new Map<number, string>();
  const assetDataMap = new Map<number, ItemDetail>();

  // Check ownership for each user ID with the unique asset IDs concurrently
  const ownershipPromises = userIds.map(async (userId) => {
    const ownership = await checkUserOwnership(userId.toString(), assetIds);
    const userOwnershipMap = new Map<number, boolean>();
    ownership.forEach((item) => {
      userOwnershipMap.set(item.id, item.owned);
    });
    return { userId, userOwnershipMap };
  });

  const [ownershipResults, thumbnails, assetData, userData] = await Promise.all(
    [
      Promise.all(ownershipPromises),
      fetchThumbnails(assetIds).catch(() => undefined),
      fetchAssetDetails(assetIds).catch(() => undefined),
      adminMode ? fetchUserData(userIds).catch(() => undefined) : undefined
    ]
  );

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

  // console.dir({ userIds, userData }, { depth: null });

  // Iterate over the payout requests and inject the ownership, thumbnail, and asset data information using the maps
  return requests.map((request) => {
    const assets = extractRobloxIDs(request.reason);
    const userOwnershipMap = ownershipMap.get(request.user_id) || new Map();
    const ownedAssets = assets.map((id) => ({
      id,
      owned: userOwnershipMap.get(id) || false,
      thumbnail: thumbnailMap.get(id) || undefined,
      assetData: assetDataMap.get(id) || undefined
    }));
    return {
      ...request,
      ownership: ownedAssets,
      user: userData?.data.find((user) => {
        // console.log(`User ID: ${user.id}, Request ID: ${request.user_id}`);
        return user.id === request.user_id;
      })
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
