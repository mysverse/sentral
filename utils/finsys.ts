import {
  PayoutRequestData,
  PendingPayoutRequestsResponse
} from "components/apiTypes";
import { endpoints } from "components/constants/endpoints";
import { extractRobloxIDs } from "./roblox";
import {
  safeRedisHdel,
  safeRedisHmget,
  safeRedisHset,
  safeRedisReplaceHash
} from "lib/redis";
import { clerkClient, User } from "@clerk/nextjs/server";
import { AppError, logAppError, toAppError, toApiError } from "lib/errors";
import {
  fetchJsonOrThrow,
  fetchJsonResult,
  readJsonSafe,
  FINSYS_PENDING_TIMEOUT,
  THUMBNAIL_TIMEOUT
} from "lib/http";
import { mergeCachedByNumericId } from "lib/cacheKeys";

export { toApiError };

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

interface InventoryItem {
  path: string;
  assetDetails: {
    assetId: string;
    inventoryItemAssetType: "INVENTORY_ITEM_ASSET_TYPE_UNSPECIFIED" | string;
    instanceId: string;
    collectibleDetails: {
      itemId: string;
      instanceId: string;
      instanceState: "COLLECTIBLE_ITEM_INSTANCE_STATE_UNSPECIFIED" | string;
      serialNumber: number;
    };
  };
  addTime: string; // ISO timestamp format
}

type InventoryItemResponse = {
  inventoryItems: Array<InventoryItem>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const ROBLOSECURITY = process.env.ROBLOSECURITY;

// Cache TTLs: bound staleness while keeping Roblox API traffic low
const ASSET_TTL_SECONDS = 24 * 60 * 60;
const USER_TTL_SECONDS = 12 * 60 * 60;
const THUMBNAIL_TTL_SECONDS = 6 * 60 * 60; // CDN URLs rotate
const ROBLOX_CLERK_MAP_TTL_SECONDS = 48 * 60 * 60; // refreshed by 6-hour cron
const ASSET_CACHE_KEY = "cache:v2:assets";
const USER_CACHE_KEY = "cache:v2:users";
const THUMBNAIL_CACHE_KEY = "cache:v2:thumbnails";
export const ROBLOX_CLERK_MAP_KEY = "identity:v2:roblox-clerk";

// Function to fetch asset details from the catalog
async function fetchAssetDetails(assetIds: number[]): Promise<ItemDetail[]> {
  if (assetIds.length === 0) {
    return [];
  }

  const fields = assetIds.map(String);
  const cached = await safeRedisHmget<ItemDetail>(ASSET_CACHE_KEY, fields);
  const missingIds = assetIds.filter((_, index) => cached[index] === null);

  if (missingIds.length === 0) {
    return cached as ItemDetail[];
  }

  let retries = 0;
  const maxRetries = 3;
  let csrf: string | undefined;

  while (retries < maxRetries) {
    const url = "https://catalog.roblox.com/v1/catalog/items/details";
    const body: AssetDetailsRequest = {
      items: missingIds.map((id) => ({ itemType: 1, id }))
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
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await readJsonSafe(response).catch(() => null);
      console.error(errorBody);
      const responseCsrf = response.headers.get("x-csrf-token");
      if (!csrf && responseCsrf) {
        csrf = responseCsrf;
        continue;
      } else {
        retries++;
        await sleep(1000);
        continue;
      }
    }

    const data = (await readJsonSafe(response)) as AssetDetailResponse;

    const returnData = data.data.map((item) => ({
      id: item.id,
      itemType: item.itemType,
      name: item.name,
      price: item.price,
      creatorTargetId: item.creatorTargetId,
      creatorName: item.creatorName
    }));

    const assetDataToCache: Record<string, ItemDetail> = {};
    returnData.forEach((item) => {
      assetDataToCache[String(item.id)] = item;
    });
    await safeRedisHset(ASSET_CACHE_KEY, assetDataToCache, {
      ttlSeconds: ASSET_TTL_SECONDS
    });

    return mergeCachedByNumericId(
      assetIds,
      cached,
      returnData,
      (item) => item.id
    );
  }

  throw new Error("Unable to get CSRF token while fetching asset details");
}

interface OwnershipResponse {
  id: number;
  owned?: boolean;
  ownDate?: Date;
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

  if (userIds.length === 0) {
    return { data: [] };
  }

  const fields = userIds.map(String);
  const cached = await safeRedisHmget<RobloxUser>(USER_CACHE_KEY, fields);
  const missingIds = userIds.filter((_, index) => cached[index] === null);
  if (missingIds.length === 0) {
    return { data: cached as RobloxUser[] };
  }

  const data = await fetchJsonOrThrow<RobloxUserResponse>(
    `https://users.roblox.com/v1/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        userIds: missingIds,
        excludeBannedUsers: true
      }),
      service: "roblox-users"
    }
  );

  const userDataToCache: Record<string, RobloxUser> = {};
  data.data.forEach((item) => {
    userDataToCache[String(item.id)] = item;
  });
  await safeRedisHset(USER_CACHE_KEY, userDataToCache, {
    ttlSeconds: USER_TTL_SECONDS
  });

  return {
    data: mergeCachedByNumericId(userIds, cached, data.data, (item) => item.id)
  };
}

async function fetchThumbnails(assetIds: number[]) {
  let retries = 0;
  const maxRetries = 3;

  type ThumbnailData = RobloxThumbnailAssetApiResponse["data"][number];

  if (assetIds.length === 0) {
    return { data: [] };
  }

  const fields = assetIds.map(String);
  const cached = await safeRedisHmget<ThumbnailData>(
    THUMBNAIL_CACHE_KEY,
    fields
  );
  const missingIds = assetIds.filter((_, index) => cached[index] === null);
  if (missingIds.length === 0) {
    return { data: cached as ThumbnailData[] };
  }

  while (retries < maxRetries) {
    const url = `https://thumbnails.roblox.com/v1/assets`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), THUMBNAIL_TIMEOUT);

    try {
      const response = await fetch(
        `https://myx-proxy.yan3321.workers.dev/myxProxy/?apiurl=${encodeURIComponent(
          `${url}?assetIds=${missingIds.join(",")}&format=Png&isCircular=false&size=420x420`
        )}`,
        {
          method: "GET",
          signal: controller.signal
        } as RequestInit
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await readJsonSafe(
          response
        )) as RobloxThumbnailAssetApiResponse;
        const thumbnailDataToCache: Record<string, ThumbnailData> = {};
        data.data.forEach((item) => {
          thumbnailDataToCache[String(item.targetId)] = item;
        });
        await safeRedisHset(THUMBNAIL_CACHE_KEY, thumbnailDataToCache, {
          ttlSeconds: THUMBNAIL_TTL_SECONDS
        });
        return {
          data: mergeCachedByNumericId(
            assetIds,
            cached,
            data.data,
            (item) => item.targetId
          )
        };
      } else {
        const errorBody = await readJsonSafe(response).catch(() => null);
        console.error(errorBody);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const appError = toAppError(error, { service: "thumbnails" });
      if (appError.kind === "timeout") {
        console.error("Thumbnail fetch timed out");
      } else {
        logAppError(appError, { service: "thumbnails" });
      }
    }
    await sleep(1000);
    retries++;
  }

  throw new AppError("Failed to fetch asset thumbnails", {
    kind: "http",
    service: "thumbnails",
    retryable: true
  });
}

const ownershipDisabled = false;

export async function cacheRobloxId(robloxId: number, clerkUserId: string) {
  await safeRedisHset(ROBLOX_CLERK_MAP_KEY, {
    [String(robloxId)]: clerkUserId
  });
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
    await safeRedisHdel(ROBLOX_CLERK_MAP_KEY, [String(robloxId)]);
  }
  return result;
}

// THIS SOLUTION WILL NOT SCALE WELL
async function getOauthTokenFromRobloxUserIds(userIds: number[]) {
  if (userIds.length === 0) {
    return userIds.map(() => null);
  }

  try {
    const clerkUserIds = await safeRedisHmget<string>(
      ROBLOX_CLERK_MAP_KEY,
      userIds.map(String)
    );

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
  const startedAt = Date.now();
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
      idCache[String(robloxId)] = user.id;
    }
  }

  if (Object.keys(idCache).length > 0) {
    await safeRedisReplaceHash(
      ROBLOX_CLERK_MAP_KEY,
      idCache,
      ROBLOX_CLERK_MAP_TTL_SECONDS
    );
  }

  return {
    usersScanned: users.length,
    mappingsWritten: Object.keys(idCache).length,
    durationMs: Date.now() - startedAt
  };
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
      const errorData = await readJsonSafe(response).catch(() => null);
      if (
        errorData &&
        typeof errorData === "object" &&
        "code" in errorData &&
        (errorData as { code: unknown }).code === "PERMISSION_DENIED"
      ) {
        // need to grant perms
        if (!token && apiKey) {
          // No token, but API key provided;
          return assetIds.map((id) => ({
            id
          }));
        }
        console.error(errorData);
        throw new AppError("Inventory permission denied", {
          kind: "auth",
          service: "roblox-inventory",
          retryable: false
        });
      }
      console.error(errorData);
      throw new AppError(
        `Failed to fetch user inventory: ${response.statusText}`,
        {
          kind: "http",
          service: "roblox-inventory",
          status: response.status,
          retryable: response.status >= 500
        }
      );
    }

    const data = (await readJsonSafe(response)) as InventoryItemResponse;

    // console.log(data);

    return assetIds.map((id) => {
      const item = data.inventoryItems.find(
        (item) => parseInt(item.assetDetails.assetId) === id
      );
      return {
        id,
        owned: item ? true : false,
        ownDate: item?.addTime ? new Date(item.addTime) : undefined
      };
    });

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
        ?.imageUrl,
      ownDate: isOwned.find((item) => item.id === asset.id)?.ownDate
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
  const ownershipDateMap = new Map<number, Map<number, Date>>();
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
    const userOwnershipDateMap = new Map<number, Date>();
    ownership.forEach((item) => {
      if (typeof item.owned !== "undefined") {
        userOwnershipMap.set(item.id, item.owned);
      }
      if (item.ownDate) {
        userOwnershipDateMap.set(item.id, item.ownDate);
      }
    });
    return { userId, userOwnershipMap, userOwnershipDateMap };
  });

  const [ownershipResults, thumbnails, assetData, userData] = await Promise.all(
    [
      Promise.all(ownershipPromises),
      fetchThumbnails(assetIds).catch(() => undefined),
      fetchAssetDetails(assetIds).catch(() => undefined),
      adminMode ? fetchUserData(userIds).catch(() => undefined) : undefined
    ]
  );

  ownershipResults.forEach(
    ({ userId, userOwnershipMap, userOwnershipDateMap }) => {
      ownershipMap.set(userId, userOwnershipMap);
      ownershipDateMap.set(userId, userOwnershipDateMap);
    }
  );

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
    const userOwnershipDateMap =
      ownershipDateMap.get(request.user_id) || new Map<number, Date>();
    const ownedAssets = assets.map((id) => ({
      id,
      owned: userOwnershipMap.get(id),
      ownDate: userOwnershipDateMap.get(id),
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
    throw new AppError("Missing API key for FinSys", {
      kind: "config",
      service: "finsys",
      retryable: false
    });
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

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    FINSYS_PENDING_TIMEOUT
  );

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw toAppError(error, { service: "finsys" });
  }
  clearTimeout(timeoutId);

  if (res.ok) {
    const data = (await readJsonSafe(res)) as PendingPayoutRequestsResponse;

    data.requests.sort((a, b) => {
      // First, prioritize pending requests
      if (a.status === "pending" && b.status !== "pending") {
        return -1;
      } else if (a.status !== "pending" && b.status === "pending") {
        return 1;
      }
      // Then, within the same status, sort by created_at in descending order
      return (
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
      );
    });
    return data.requests;
  }

  const data = await readJsonSafe(res).catch(() => null);
  const message =
    data && typeof data === "object" && "error" in data
      ? String((data as { error: unknown }).error)
      : `HTTP ${res.status}`;
  throw new AppError(message, {
    kind: "http",
    service: "finsys",
    status: res.status,
    retryable: res.status >= 500
  });
}

export async function getPendingRequestsResult(
  userId?: string | number,
  limit?: number,
  offset?: number
) {
  try {
    const data = await getPendingRequests(userId, limit, offset);
    return { ok: true as const, data };
  } catch (error) {
    const appError = toAppError(error, { service: "finsys" });
    logAppError(appError, { service: "finsys" });
    return { ok: false as const, error: appError };
  }
}

interface FinsysPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

export async function getPermissionsOrThrow(userId: string) {
  if (!apiKey) {
    throw new AppError("Missing API key for FinSys", {
      kind: "config",
      service: "finsys",
      retryable: false
    });
  }

  const url = new URL(`${endpoints.finsys}/permissions`);
  url.searchParams.set("userId", userId);

  const result = await fetchJsonResult<FinsysPermissions>(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    service: "finsys"
  });

  if (!result.ok) {
    throw result.error;
  }

  return result.data;
}

export async function getPermissions(userId: string) {
  if (!apiKey) {
    throw new AppError("Missing API key for FinSys", {
      kind: "config",
      service: "finsys",
      retryable: false
    });
  }

  const url = new URL(`${endpoints.finsys}/permissions`);

  url.searchParams.set("userId", userId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw toAppError(error, { service: "finsys" });
  }
  clearTimeout(timeoutId);

  if (res.ok) {
    const data = (await readJsonSafe(res)) as FinsysPermissions;
    return data;
  }

  const data = await readJsonSafe(res).catch(() => null);
  const message =
    data && typeof data === "object" && "error" in data
      ? String((data as { error: unknown }).error)
      : `HTTP ${res.status}`;
  throw new AppError(message, {
    kind: "http",
    service: "finsys",
    status: res.status,
    retryable: false
  });
}
