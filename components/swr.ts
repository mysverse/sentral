import useSWR from "swr";

import { DefaultAPIResponse, NametagTemplate, StaffDecision } from "./apiTypes";

import { endpoints } from "./constants/endpoints";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const url =
    seriesIdentifier &&
    `${endpoints.invote}/stats/seats/${encodeURIComponent(seriesIdentifier)}`;
  const { data, error } = useSWR(
    shouldFetch && seriesIdentifier ? url : null,
    fetcher
  );

  return {
    stats: data as InvoteSeats[],
    isLoading: !error && !data,
    isError: error as Error,
    url
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

interface TimeCaseStats {
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

interface NewBlacklistData {
  name: string;
  id?: string;
  type: "user" | "group";
  updated: string;
  types: string[];
}

export function useCombinedBlacklistData(shouldFetch: boolean) {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? `https://mysverse-blacklist.yan3321.workers.dev/new` : null,
    fetcher
  );

  const response = data as NewBlacklistData[] | undefined;

  return {
    apiResponse: response && {
      users: response.filter((item) => item.type === "user"),
      groups: response.filter((item) => item.type === "group")
    },
    isLoading: isLoading,
    isError: error
  };
}

const blobFetcher = async (input: RequestInfo) => {
  const res = await fetch(input);
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
