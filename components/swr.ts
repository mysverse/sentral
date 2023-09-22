import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import {
  ApiSessionStats,
  BlacklistItem,
  DefaultAPIResponse,
  GrowthEntry,
  NametagTemplate,
  StaffDecision
} from "./apiTypes";

const endpoints = {
  mecs: process.env.NEXT_PUBLIC_MECS_API_URL,
  gentag: process.env.NEXT_PUBLIC_GENTAG_API_URL,
  growth: process.env.NEXT_PUBLIC_GROWTH_API_URL,
  invote: process.env.NEXT_PUBLIC_INVOTE_API_URL,
  mysverse: process.env.NEXT_PUBLIC_MYSVERSE_FETCHER_URL
};

const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error((res.json() as any).error);
  }
  return res.json();
};

export function useGrowthData(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.growth}` : null,
    fetcher
  );

  return {
    growthData: data as GrowthEntry[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

interface StaffStatsItem {
  officer: {
    id: number;
    name: string;
  };
  decisions: {
    dar: {
      percentage: number;
      data: {
        correct: number;
        total: number;
        valid?: {
          total: number;
          correct: number;
        };
      };
    };
    atbd?: {
      mtbd: {
        mean: number;
        mode: number;
        median: number;
      };
    };
  };
  last5: StaffDecision[];
}

interface AuditStats {
  actors: number;
  dar: {
    total: number;
    correct: number;
    valid?: {
      total: number;
      correct: number;
    };
  };
  mtbd: number;
  timeRange: {
    latest: string;
    oldest: string;
  };
}

interface InvoteStatsItem {
  name: string;
  votes: number;
}
interface InvoteStats {
  hidden: boolean;
  data: InvoteStatsItem[];
}

export interface InvoteStatsTimestamp {
  timestamp: string;
  results: InvoteStats;
}

export function useInvoteSeriesIdentifiers(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.invote}/stats/series-identifiers` : null,
    fetcher
  );

  return {
    stats: data as string[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useInvoteStats(
  shouldFetch: boolean,
  seriesIdentifier?: string
) {
  const { data, error } = useSWR(
    shouldFetch && seriesIdentifier
      ? `${
          endpoints.invote
        }/stats/timestamp?series_identifier=${encodeURIComponent(
          seriesIdentifier
        )}`
      : null,
    fetcher
  );

  return {
    stats: data as InvoteStatsTimestamp[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export interface InvoteSeats {
  index: number;
  party: string | null;
}

export function useInvoteSeatStats(
  shouldFetch: boolean,
  seriesIdentifier?: string
) {
  const { data, error } = useSWR(
    shouldFetch && seriesIdentifier
      ? `${endpoints.invote}/stats/seats/${encodeURIComponent(
          seriesIdentifier
        )}`
      : null,
    fetcher
  );

  return {
    stats: data as InvoteSeats[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

// https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=1055048&size=420x420&format=Png&isCircular=false

interface AvatarData {
  targetId: number;
  state: string;
  imageUrl: string;
}

interface AvatarResponse {
  data: AvatarData[];
}

export function useAvatarThumbnails(shouldFetch: boolean, userIds: number[]) {
  const { data, error } = useSWR(
    shouldFetch && userIds
      ? `https://myx-proxy.yan3321.workers.dev/myxProxy/?apiurl=${encodeURIComponent(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(
            ","
          )}&size=100x100&format=Png&isCircular=false`
        )}`
      : null,
    fetcher
  );

  return {
    stats: data as AvatarResponse,
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useStaffStats(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.mecs}/audit/staff` : null,
    fetcher
  );

  return {
    staffStats: data as StaffStatsItem[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export interface TimeCaseStats {
  time: string;
  granted: number;
  total: number;
}

export function useTimeCaseStats(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.mecs}/stats/case` : null,
    fetcher
  );

  return {
    stats: data as TimeCaseStats[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useAuditStats(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.mecs}/audit/accuracy` : null,
    fetcher
  );

  return {
    auditStats: data as AuditStats,
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useApiSessionStats(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.mecs}/session` : null,
    fetcher
  );

  return {
    apiSessionStats: data as ApiSessionStats,
    isLoading: !error && !data,
    isError: error as Error
  };
}

export interface OpenCollectiveMemberItem {
  MemberId: number;
  createdAt: string;
  type: string;
  role: string;
  isActive: boolean;
  totalAmountDonated: number;
  currency?: string;
  lastTransactionAt: string;
  lastTransactionAmount: number;
  profile: string;
  name: string;
  company: null;
  description: null | string;
  image: null | string;
  email?: null;
  twitter: null | string;
  github: null | string;
  website: null | string;
  tier?: string;
}

export function useOpenCollectiveMemberStats(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch
      ? `https://opencollective.com/myxlabs/members.json?limit=10&offset=0`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    apiResponse: data as OpenCollectiveMemberItem[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useUserData(
  username: string,
  shouldFetch: boolean,
  treatAsUserId?: boolean
) {
  const url = new URL(`${endpoints.mecs}/user/${username.toLowerCase()}`);

  if (typeof treatAsUserId !== "undefined") {
    url.searchParams.set("paramType", treatAsUserId ? "id" : "name");
  }

  const { data, error } = useSWR(shouldFetch ? url.toString() : null, fetcher, {
    revalidateOnFocus: false
  });

  return {
    apiResponse: data as DefaultAPIResponse,
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useBlacklistData(
  type: "users" | "groups",
  shouldFetch: boolean
) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.mecs}/blacklist/${type}` : null,
    fetcher
  );

  return {
    apiResponse: data as BlacklistItem[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useCombinedBlacklistData(shouldFetch: boolean) {
  const { apiResponse, isLoading, isError } = useBlacklistData(
    "users",
    shouldFetch
  );
  const {
    apiResponse: groupData,
    isLoading: groupLoading,
    isError: groupError
  } = useBlacklistData("groups", shouldFetch);

  return {
    apiResponse: {
      users: apiResponse,
      groups: groupData
    },
    isLoading: isLoading || groupLoading,
    isError: isError || groupError
  };
}

const blobFetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new Error((res.json() as any).error);
  }
  return res.blob();
};

export function useNametagTemplates(shouldFetch: boolean) {
  const { data, error } = useSWR(
    shouldFetch ? `${endpoints.gentag}/nametag/options` : null,
    fetcher
  );

  return {
    templates: data as NametagTemplate[],
    isLoading: !error && !data,
    isError: error as Error
  };
}

export function useImageData(
  name: string,
  index: number,
  preview: boolean = false,
  tShirtIDs: number[] = [],
  shouldFetch: boolean
) {
  const url = new URL(
    `${endpoints.gentag}/nametag/${
      preview ? "preview" : "create"
    }/${encodeURIComponent(index)}/${encodeURIComponent(name)}`
  );
  for (const id of tShirtIDs) {
    url.searchParams.append("assetId", id.toString());
  }
  const { data, error } = useSWR(
    shouldFetch ? url.toString() : null,
    blobFetcher
  );
  return {
    image: data as Blob,
    isLoading: !error && !data,
    isError: error as Error
  };
}

export interface MYSverseData {
  summons: Summon[];
  arrests: Arrest[];
  bandarData: BandarData;
}

export interface Arrest {
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

export interface BandarData {
  GE12_Votes_ByElection2: boolean;
  GE10_Registered: boolean;
  MYS_POS_2: MysPos2;
  ringgit: number;
  DailyReward: DailyReward[];
  MYS_Devices_1: MYSDevices1;
  GE11_Registeredv2: boolean;
  SessionTimeKeeper: number;
  TimeOnMAF: number;
  MYS_Message_2: MYSMessage2;
  GE13_Votes_1: boolean;
  MYS_Quest_2: MYSQuest2;
  MYS_Refund_2: boolean;
  bandar_ringgit: number;
  MYS_PermanentVehicles_2: MYSPermanentVehicles2[];
  MYS_Taxi_2: MYSTaxi2;
}

export interface DailyReward {
  reward: Reward;
  TimeClaimed: number;
  dayEpoch: number;
}

export enum Reward {
  Stuff = "stuff"
}

export interface MYSDevices1 {
  SavedBackground: string;
}

export interface MYSMessage2 {
  BlockedUsers: any[];
  Friends: { [key: string]: string };
}

export interface MysPos2 {
  Salary: number;
  Money: number;
  MaxXP: number;
  Level: number;
  Suspended: boolean;
  XP: number;
  Packages: number;
}

export interface MYSPermanentVehicles2 {
  VehicleName: string;
  Time: number;
}

export interface MYSQuest2 {
  Quests: string[];
}

export interface MYSTaxi2 {
  Suspended: boolean;
  Customer: number;
  Money: number;
}

export interface Summon {
  SummonedPlayer: number;
  Reference: string;
  Dispute: boolean;
  OffenceTime: Date;
  Officer: number;
  FineAmount: number;
  OffenceDescription: string;
}

export function useMysverseData(shouldFetch: boolean, userId?: string) {
  const url = new URL(`${endpoints.mysverse}/`);

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  const { data, error } = useSWRImmutable(
    shouldFetch ? url.toString() : null,
    fetcher
  );

  return {
    apiResponse: data as MYSverseData,
    isLoading: !error && !data,
    isError: error as Error
  };
}
