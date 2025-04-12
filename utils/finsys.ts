import {
  PayoutRequestData,
  PendingPayoutRequestsResponse
} from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";
import { extractRobloxIDs } from "./roblox";
import { redis } from "lib/redis";
import { clerkClient, User } from "@clerk/nextjs/server";

const apiKey = process.env.MYSVERSE_FINSYS_API_KEY;
const provider = "custom_roblox";

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
  const assetData = await redis.mget<(ItemDetail | null)[]>(...assetKeys);

  if (assetData.every((item) => item !== null)) {
    // console.log("All assets found in cache");
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
  owned?: boolean;
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
  const userData = await redis.mget<(RobloxUser | null)[]>(...userKeys);
  if (userData.every((item) => item !== null)) {
    // console.log("All users found in cache");
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
  const thumbnailData = await redis.mget<(ThumbnailData | null)[]>(
    ...thumbnailKeys
  );
  if (thumbnailData.every((item) => item !== null)) {
    // console.log("All thumbnails found in cache");
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

const ownershipDisabled = false;

const generateCacheKey = (robloxId: number) =>
  `roblox_user_id_to_clerk:${robloxId}`;

export async function cacheRobloxId(robloxId: number, clerkUserId: string) {
  await redis.set(generateCacheKey(robloxId), clerkUserId);
}

export async function getRobloxOauthTokenFromClerkUserId(
  client: Awaited<ReturnType<typeof clerkClient>>,
  clerkUserId?: string,
  robloxId?: number
) {
  let result: string | null = null;
  try {
    if (clerkUserId) {
      const oauthToken = await client.users.getUserOauthAccessToken(
        clerkUserId,
        provider
      );
      const token = oauthToken.data[0]?.token;
      if (token) {
        result = token;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error fetching Roblox oauth token for user ${clerkUserId}:`,
        error.message
      );
    }
  }
  if (result === null && robloxId) {
    console.log(
      `Failed to get oauth token for user ${robloxId}, deleting cache key`
    );
    await redis.del(generateCacheKey(robloxId));
  }
  return result;
}

// THIS SOLUTION WILL NOT SCALE WELL
async function getOauthTokenFromRobloxUserIds(userIds: number[]) {
  if (userIds.length === 0) {
    return userIds.map(() => null);
  }

  try {
    const key = generateCacheKey;
    const clerkUserIds = await redis.mget<(string | null)[]>(userIds.map(key));

    const client = await clerkClient();

    return await Promise.all(
      clerkUserIds.map((clerkUserId, index) =>
        clerkUserId
          ? getRobloxOauthTokenFromClerkUserId(
              client,
              clerkUserId,
              userIds[index]
            )
          : null
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Error fetching oauth token, returning empty array:",
        error.message
      );
    }
    return userIds.map(() => null);
  }
}

export async function updateRobloxToClerkMap() {
  const client = await clerkClient();

  const users: User[] = [];

  const limit = 500;

  let userResponse = await client.users.getUserList({ limit });
  users.push(...userResponse.data);

  while (userResponse.totalCount > users.length) {
    userResponse = await client.users.getUserList({
      limit,
      offset: users.length
    });
    users.push(...userResponse.data);
  }

  const idCache: Record<string, string> = {};

  for (const user of users) {
    const robloxAccount = user.externalAccounts.find(
      (account) => account.provider === `oauth_${provider}`
    );
    if (robloxAccount) {
      const robloxId = parseInt(robloxAccount.externalId);
      const key = generateCacheKey(robloxId);
      idCache[key] = user.id;
      console.log(`Caching ${robloxId} -> ${user.id}`);
    }
  }

  if (Object.keys(idCache).length > 0) {
    await redis.mset(idCache);
  }

  const tokens = await Promise.all(
    Object.keys(idCache).map(async (key) => {
      const clerkId = idCache[key];
      const oauthToken = await getRobloxOauthTokenFromClerkUserId(
        client,
        clerkId
      );
      return {
        key,
        value: clerkId,
        token: oauthToken ? true : false
      };
    })
  );

  return tokens;
}

// Function to check if a user owns a specific asset
async function checkUserOwnership(
  userId: string,
  assetIds: number[],
  token?: string
): Promise<OwnershipResponse[]> {
  const apiKey = process.env.ROBLOX_API_KEY;

  if (ownershipDisabled || (!token && !apiKey)) {
    return assetIds.map((id) => ({
      id
    }));
  }

  const maxPageSize = Math.max(assetIds.length, 100);

  try {
    const url = `https://apis.roblox.com/cloud/v2/users/${userId}/inventory-items`;

    const headers: Record<string, string> = {
      ...(token && { authorization: `Bearer ${token}` }),
      ...(apiKey && !token && { "x-api-key": apiKey })
    };

    const response = await fetch(
      `${url}?maxPageSize=${maxPageSize}&filter=assetIds=${assetIds.join(",")}`,
      {
        method: "GET",
        headers,
        next: {
          revalidate: 60
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData?.code === "PERMISSION_DENIED") {
        // need to grant perms
        if (!token && apiKey) {
          // No token, but API key provided;
          return assetIds.map((id) => ({
            id
          }));
        }
        console.error(errorData);
        throw new Error("PERMISSION_DENIED");
      }
      console.error(errorData);
      throw new Error(`Failed to fetch user inventory: ${response.statusText}`);
    }

    const data: InventoryItemResponse = await response.json();

    // console.log(data);

    return assetIds.map((id) => ({
      id,
      owned: data.inventoryItems.some(
        (item) => parseInt(item.assetDetails.assetId) === id
      )
    }));

    // throw new Error(`Failed to fetch user inventory: CSRF`);
  } catch {
    return assetIds.map((id) => ({
      id
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
  function dedupe(array: number[]) {
    return Array.from(new Set(array)).sort((a, b) => a - b);
  }

  function getAssetIds(requests: PayoutRequestData[]) {
    const ids = requests.flatMap((request) => extractRobloxIDs(request.reason));
    return dedupe(ids);
  }

  const assetIds = getAssetIds(requests);

  const userIds = dedupe(requests.map((request) => request.user_id));

  const ownerships = await getOauthTokenFromRobloxUserIds(userIds);

  // Create maps to store the ownership, thumbnail, and asset data results
  const ownershipMap = new Map<number, Map<number, boolean>>();
  const thumbnailMap = new Map<number, string>();
  const assetDataMap = new Map<number, ItemDetail>();

  // Check ownership for each user ID with the unique asset IDs concurrently
  const ownershipPromises = userIds.map(async (userId, index) => {
    const userAssetIds = getAssetIds(
      requests.filter((request) => request.user_id === userId)
    );

    const ownership = await checkUserOwnership(
      userId.toString(),
      userAssetIds,
      ownerships[index] ?? undefined
    );
    const userOwnershipMap = new Map<number, boolean>();
    ownership.forEach((item) => {
      if (typeof item.owned !== "undefined") {
        userOwnershipMap.set(item.id, item.owned);
      }
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
    const userOwnershipMap =
      ownershipMap.get(request.user_id) || new Map<number, boolean>();
    const ownedAssets = assets.map((id) => ({
      id,
      owned: userOwnershipMap.get(id),
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

export async function getPendingRequests(
  userId?: string | number,
  limit?: number,
  offset?: number
) {
  if (!apiKey) {
    throw new Error("Missing API key for FinSys");
  }

  const url = new URL(`${endpoints.finsys}/pending-requests`);

  if (userId) {
    url.searchParams.set("userId", userId.toString());
  }

  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  if (offset) {
    url.searchParams.set("offset", offset.toString());
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
