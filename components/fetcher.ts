import { redis } from "lib/redis";
import { GrowthEntry } from "./apiTypes";

import { endpoints } from "./constants/endpoints";
import { Leaderboard } from "./constants/types";

async function fetchURL(
  url: string | URL | Request,
  init?: RequestInit | undefined
) {
  if (!url) {
    throw new Error("URL is null");
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(await res.json());
  }
  const data = await res.json();
  return data;
}

export async function getGrowthData() {
  const data: GrowthEntry[] = await fetchURL(`${endpoints.growth}`, {
    next: { revalidate: 60 }
  });
  return data;
}

// interface StaffStatsItem {
//   officer: {
//     id: number;
//     name: string;
//   };
//   decisions: {
//     dar: {
//       percentage: number;
//       data: {
//         correct: number;
//         total: number;
//         valid?: {
//           total: number;
//           correct: number;
//         };
//       };
//     };
//     atbd?: {
//       mtbd: {
//         mean: number;
//         mode: number;
//         median: number;
//       };
//     };
//   };
//   last5: StaffDecision[];
// }

// interface AuditStats {
//   actors: number;
//   dar: {
//     total: number;
//     correct: number;
//     valid?: {
//       total: number;
//       correct: number;
//     };
//   };
//   mtbd: number;
//   timeRange: {
//     latest: string;
//     oldest: string;
//   };
// }

// interface InvoteStatsItem {
//   name: string;
//   votes: number;
// }
// interface InvoteStats {
//   hidden: boolean;
//   data: InvoteStatsItem[];
// }

// interface InvoteStatsTimestamp {
//   timestamp: string;
//   results: InvoteStats;
// }

// async function getInvoteSeriesIdentifiers() {
//   const data: string[] = await fetchURL(
//     `${endpoints.invote}/stats/series-identifiers`
//   );

//   return data;
// }

// async function getInvoteStats(seriesIdentifier: string) {
//   const data: InvoteStatsTimestamp[] = await fetchURL(
//     `${endpoints.invote}/stats/timestamp?series_identifier=${encodeURIComponent(
//       seriesIdentifier
//     )}`
//   );

//   return data;
// }

export interface InvoteSeats {
  index: number;
  party: string | null;
}

// async function getInvoteSeatStats(seriesIdentifier: string) {
//   const data: InvoteSeats[] = await fetchURL(
//     `${endpoints.invote}/stats/seats/${encodeURIComponent(seriesIdentifier)}`
//   );
//   return data;
// }

// https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=1055048&size=420x420&format=Png&isCircular=false

interface AvatarData {
  targetId: number;
  state: "Pending" | "Completed";
  imageUrl: string;
}

interface AvatarResponse {
  data: AvatarData[];
}

async function fetchAvatarThumbnails(
  userIds: number[],
  size = 100,
  type: "headshot" | "bust" = "headshot"
) {
  const url = new URL(`https://thumbnails.roblox.com/v1/users/avatar-${type}`);
  url.searchParams.set("userIds", userIds.sort().join(","));
  url.searchParams.set("size", `${size}x${size}`);
  url.searchParams.set("format", "Webp");

  const proxyUrl = new URL(`https://myx-proxy.yan3321.workers.dev/myxProxy/`);
  proxyUrl.searchParams.set("apiurl", url.toString());

  const response = await fetch(proxyUrl);

  if (response.ok) {
    const data: AvatarResponse = await response.json();
    const filteredData = data.data.filter((item) => item.state === "Completed");
    if (filteredData.length > 0) {
      const cacheRecords: Record<string, AvatarData> = {};
      for (const item of filteredData) {
        if (item.targetId) {
          cacheRecords[`avatar:${type}:${size}:${item!.targetId}`] = item;
        }
      }
      await redis.mset<AvatarData>(cacheRecords);
    }
    return data.data;
  } else {
    console.error(await response.json());
  }

  throw new Error("Failed to fetch avatar thumbnails");
}

export async function getAvatarThumbnails(
  userIds: number[],
  size = 100,
  type: "headshot" | "bust" = "headshot"
) {
  userIds = userIds.sort();

  if (userIds.length === 0) {
    return [];
  }

  const cachedThumbnails = await redis.mget<(AvatarData | null)[]>(
    userIds.map((id) => `avatar:${type}:${size}:${id}`)
  );

  const available = cachedThumbnails.filter((item) => item !== null);
  const missingIds = userIds.filter((_, i) => !cachedThumbnails[i]);

  if (missingIds.length > 0) {
    const missingData = await fetchAvatarThumbnails(missingIds, size, type);
    return available.concat(missingData);
  } else {
    return available;
  }
}

// async function getStaffStats() {
//   const data: StaffStatsItem[] = await fetchURL(
//     `${endpoints.mecs}/audit/staff`
//   );

//   return data;
// }

// interface TimeCaseStats {
//   time: string;
//   granted: number;
//   total: number;
// }

// async function getTimeCaseStats() {
//   const data: TimeCaseStats[] = await fetchURL(`${endpoints.mecs}/stats/case`);

//   return data;
// }

// async function getAuditStats() {
//   const data: AuditStats = await fetchURL(`${endpoints.mecs}/audit/accuracy`);

//   return data;
// }

// async function getApiSessionStats() {
//   const data: ApiSessionStats = await fetchURL(`${endpoints.mecs}/session`);

//   return data;
// }

// interface OpenCollectiveMemberItem {
//   MemberId: number;
//   createdAt: string;
//   type: string;
//   role: string;
//   isActive: boolean;
//   totalAmountDonated: number;
//   currency?: string;
//   lastTransactionAt: string;
//   lastTransactionAmount: number;
//   profile: string;
//   name: string;
//   company: null;
//   description: null | string;
//   image: null | string;
//   email?: null;
//   twitter: null | string;
//   github: null | string;
//   website: null | string;
//   tier?: string;
// }

// async function getOpenCollectiveMemberStats() {
//   const data: OpenCollectiveMemberItem[] = await fetchURL(
//     `https://opencollective.com/myxlabs/members.json?limit=10&offset=0`
//   );

//   return data;
// }

// async function getUserData(username: string, treatAsUserId?: boolean) {
//   const url = new URL(`${endpoints.mecs}/user/${username.toLowerCase()}`);

//   if (typeof treatAsUserId !== "undefined") {
//     url.searchParams.set("paramType", treatAsUserId ? "id" : "name");
//   }

//   const data: DefaultAPIResponse = await fetchURL(url.toString());

//   return data;
// }

// async function getBlacklistData(type: "users" | "groups") {
//   const data: BlacklistItem[] = await fetchURL(
//     `${endpoints.mecs}/blacklist/${type}`
//   );

//   return data;
// }

// async function getCombinedBlacklistData() {
//   const apiResponse = getBlacklistData("users");

//   const groupData = getBlacklistData("groups");

//   return {
//     users: apiResponse,
//     groups: groupData
//   };
// }

// async function getNametagTemplates() {
//   const data: NametagTemplate[] = await fetchURL(
//     `${endpoints.gentag}/nametag/options`
//   );

//   return data;
// }

// async function getImageData(
//   name: string,
//   index: number,
//   preview: boolean = false,
//   tShirtIDs: number[] = []
// ) {
//   const url = new URL(
//     `${endpoints.gentag}/nametag/${
//       preview ? "preview" : "create"
//     }/${encodeURIComponent(index)}/${encodeURIComponent(name)}`
//   );
//   for (const id of tShirtIDs) {
//     url.searchParams.append("assetId", id.toString());
//   }
//   const data = await fetch(url.toString());

//   const blob = await data.blob();

//   return blob;
// }

export interface MYSverseData {
  summons: Summon[];
  arrests: Arrest[];
  bandarData: BandarData;
}

interface Arrest {
  LastUpdatedBy?: number;
  Location_Arrest: number[];
  TimeLastUpdated: Date | null;
  Reference: string;
  Description: boolean | string;
  Time_Arrest: Date;
  Player_Arrested: number;
  Player_Arresting: number;
  StringLocation?: string;
  Time_Release: Date;
  Notes?: string;
}

interface BandarData {
  GE12_Votes_ByElection2: boolean;
  GE10_Registered: boolean;
  MYS_POS_2?: MysPos2;
  ringgit: number;
  DailyReward: DailyReward[];
  MYS_Devices_1: MYSDevices1;
  GE11_Registeredv2: boolean;
  SessionTimeKeeper: number;
  TimeOnMAF?: number;
  TimeOnPDRM?: number;
  TimeOnMYT?: number;
  MYS_Message_2: MYSMessage2;
  GE13_Votes_1: boolean;
  MYS_Quest_2: MYSQuest2;
  MYS_Refund_2: boolean;
  bandar_ringgit: number;
  MYS_PermanentVehicles_2: MYSPermanentVehicles2[];
  MYS_Taxi_2: MYSTaxi2;
}

interface DailyReward {
  reward: Reward;
  TimeClaimed: number;
  dayEpoch: number;
}

enum Reward {
  Stuff = "stuff"
}

interface MYSDevices1 {
  SavedBackground: string;
}

interface MYSMessage2 {
  BlockedUsers: any[];
  Friends: { [key: string]: string };
}

interface MysPos2 {
  Salary: number;
  Money: number;
  MaxXP: number;
  Level: number;
  Suspended: boolean;
  XP: number;
  Packages: number;
}

interface MYSPermanentVehicles2 {
  VehicleName: string;
  Time: number;
}

interface MYSQuest2 {
  Quests: string[];
}

interface MYSTaxi2 {
  Suspended: boolean;
  Customer: number;
  Money: number;
}

interface Summon {
  SummonedPlayer: number;
  Reference: string;
  Dispute: boolean;
  OffenceTime: Date;
  Officer: number;
  FineAmount: number;
  OffenceDescription: string;
}

export async function getLeaderboardData(type?: string) {
  const url = new URL(`${endpoints.mysverse}/`);
  url.searchParams.set("type", "lebuhraya_jersik_leaderboard");

  if (type) {
    url.searchParams.set("leaderboardType", type);
  }

  const data: Leaderboard[] = await fetchURL(url.toString(), {
    next: { revalidate: 60 }
  });

  return data;
}

export async function getMysverseData(userId?: number) {
  const url = new URL(`${endpoints.mysverse}/`);

  if (userId) {
    url.searchParams.set("userId", userId.toString());
  }

  const data: MYSverseData = await fetchURL(url.toString(), {
    next: { revalidate: 60 }
  });

  return data;
}
