import useSWR from "swr";

import { DefaultAPIResponse, NametagTemplate, StaffDecision } from "./apiTypes";

import { endpoints } from "./constants/endpoints";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const endpointUrl = (base: string | undefined, path: string) => {
  if (!base) {
    return null;
  }

  const normalizedBase = base.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return new URL(`${normalizedBase}${normalizedPath}`).toString();
  } catch {
    return null;
  }
};

const readJson = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("The API returned a response Sentral could not read.");
  }
};

const responseErrorMessage = (data: unknown, fallback: string) => {
  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (!isRecord(data)) {
    return fallback;
  }

  const message = data.message ?? data.error ?? data.detail;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (Array.isArray(data.errors)) {
    const messages = data.errors.flatMap((error) => {
      if (typeof error === "string") {
        return [error];
      }

      if (
        isRecord(error) &&
        typeof error.message === "string" &&
        error.message.trim().length > 0
      ) {
        return [error.message];
      }

      return [];
    });

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  return fallback;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(
      responseErrorMessage(data, `Request failed (${response.status})`)
    );
  }

  return data;
};

const unexpectedResponseError = (label: string) =>
  new Error(`${label} returned an unexpected response.`);

const hasData = (data: unknown) => typeof data !== "undefined";

const isDefaultAPIResponse = (data: unknown): data is DefaultAPIResponse => {
  if (!isRecord(data) || !isRecord(data.user)) {
    return false;
  }

  return (
    typeof data.user.userId === "number" &&
    typeof data.user.username === "string" &&
    isRecord(data.tests)
  );
};

const isStatsCount = (data: unknown) =>
  isRecord(data) && isNumber(data.total) && isNumber(data.correct);

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

const isAvatarData = (data: unknown): data is AvatarData =>
  isRecord(data) &&
  isNumber(data.targetId) &&
  isString(data.state) &&
  isString(data.imageUrl);

const isStaffStatsItem = (data: unknown): data is StaffStatsItem => {
  if (
    !isRecord(data) ||
    !isRecord(data.officer) ||
    !isRecord(data.decisions) ||
    !isRecord(data.decisions.dar)
  ) {
    return false;
  }

  const dar = data.decisions.dar;
  const darData = dar.data;

  if (!isRecord(darData)) {
    return false;
  }

  return (
    isNumber(data.officer.id) &&
    isString(data.officer.name) &&
    isNumber(dar.percentage) &&
    isStatsCount(darData) &&
    (!darData.valid || isStatsCount(darData.valid)) &&
    Array.isArray(data.last5)
  );
};

const isTimeCaseStats = (data: unknown): data is TimeCaseStats =>
  isRecord(data) &&
  isString(data.time) &&
  isNumber(data.granted) &&
  isNumber(data.total);

const isAuditStats = (data: unknown): data is AuditStats => {
  if (!isRecord(data) || !isRecord(data.dar) || !isRecord(data.timeRange)) {
    return false;
  }

  return (
    isStatsCount(data.dar) &&
    (!data.dar.valid || isStatsCount(data.dar.valid)) &&
    isNumber(data.mtbd) &&
    isString(data.timeRange.latest) &&
    isString(data.timeRange.oldest)
  );
};

export function useAvatarThumbnails(shouldFetch: boolean, userIds: number[]) {
  const validUserIds = userIds.filter((id) => Number.isFinite(id));
  const shouldLoad = shouldFetch && validUserIds.length > 0;

  const { data, error } = useSWR(
    shouldLoad
      ? `https://myx-proxy.yan3321.workers.dev/myxProxy/?apiurl=${encodeURIComponent(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${validUserIds.join(
            ","
          )}&size=100x100&format=Png&isCircular=false`
        )}`
      : null,
    fetcher
  );

  const stats =
    isRecord(data) && Array.isArray(data.data)
      ? ({ data: data.data.filter(isAvatarData) } satisfies AvatarResponse)
      : undefined;

  return {
    stats,
    isLoading: shouldLoad && !error && !hasData(data),
    isError: (error ||
      (hasData(data) && !stats
        ? unexpectedResponseError("Roblox thumbnails")
        : undefined)) as Error | undefined
  };
}

export function useStaffStats(shouldFetch: boolean) {
  const url = endpointUrl(endpoints.mecs, "/audit/staff");
  const { data, error } = useSWR(shouldFetch ? url : null, fetcher);
  const staffStats = Array.isArray(data)
    ? data.filter(isStaffStatsItem)
    : undefined;

  return {
    staffStats,
    isLoading: shouldFetch && !!url && !error && !hasData(data),
    isError: (error ||
      (shouldFetch && !url
        ? new Error("The MECS API is not configured.")
        : hasData(data) && !staffStats
          ? unexpectedResponseError("MECS staff stats")
          : undefined)) as Error | undefined
  };
}

interface TimeCaseStats {
  time: string;
  granted: number;
  total: number;
}

export function useTimeCaseStats(shouldFetch: boolean) {
  const url = endpointUrl(endpoints.mecs, "/stats/case");
  const { data, error } = useSWR(shouldFetch ? url : null, fetcher);
  const stats = Array.isArray(data) ? data.filter(isTimeCaseStats) : undefined;

  return {
    stats,
    isLoading: shouldFetch && !!url && !error && !hasData(data),
    isError: (error ||
      (shouldFetch && !url
        ? new Error("The MECS API is not configured.")
        : hasData(data) && !stats
          ? unexpectedResponseError("MECS case stats")
          : undefined)) as Error | undefined
  };
}

export function useAuditStats(shouldFetch: boolean) {
  const url = endpointUrl(endpoints.mecs, "/audit/accuracy");
  const { data, error } = useSWR(shouldFetch ? url : null, fetcher);
  const auditStats = isAuditStats(data) ? data : undefined;

  return {
    auditStats,
    isLoading: shouldFetch && !!url && !error && !hasData(data),
    isError: (error ||
      (shouldFetch && !url
        ? new Error("The MECS API is not configured.")
        : hasData(data) && !auditStats
          ? unexpectedResponseError("MECS audit stats")
          : undefined)) as Error | undefined
  };
}

export function useUserData(
  username: string,
  shouldFetch: boolean,
  treatAsUserId?: boolean
) {
  const urlString = endpointUrl(
    endpoints.mecs,
    `/user/${encodeURIComponent(username.toLowerCase())}`
  );
  const url = urlString ? new URL(urlString) : null;

  if (url && typeof treatAsUserId !== "undefined") {
    url.searchParams.set("paramType", treatAsUserId ? "id" : "name");
  }

  const { data, error } = useSWR(
    shouldFetch ? url?.toString() : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );
  const apiResponse = isDefaultAPIResponse(data) ? data : undefined;

  return {
    apiResponse,
    isLoading: shouldFetch && !!url && !error && !hasData(data),
    isError: (error ||
      (shouldFetch && !url
        ? new Error("The MECS API is not configured.")
        : hasData(data) && !apiResponse
          ? unexpectedResponseError("MECS user search")
          : undefined)) as Error | undefined
  };
}

interface NewBlacklistData {
  name: string;
  id?: string;
  type: "user" | "group";
  updated: string;
  types: string[];
}

const isNewBlacklistData = (data: unknown): data is NewBlacklistData =>
  isRecord(data) &&
  isString(data.name) &&
  (typeof data.id === "undefined" || isString(data.id)) &&
  (data.type === "user" || data.type === "group") &&
  isString(data.updated) &&
  Array.isArray(data.types);

export function useCombinedBlacklistData(shouldFetch: boolean) {
  const { data, isLoading, error } = useSWR(
    shouldFetch ? `https://mysverse-blacklist.yan3321.workers.dev/new` : null,
    fetcher
  );

  const response = Array.isArray(data)
    ? data.filter(isNewBlacklistData)
    : undefined;

  return {
    apiResponse: response && {
      users: response.filter((item) => item.type === "user"),
      groups: response.filter((item) => item.type === "group")
    },
    isLoading: isLoading,
    isError: (error ||
      (hasData(data) && !response
        ? unexpectedResponseError("Blacklist")
        : undefined)) as Error | undefined
  };
}

const blobFetcher = async (input: RequestInfo) => {
  const res = await fetch(input);
  if (!res.ok) {
    throw new Error(
      responseErrorMessage(
        await readJson(res),
        `Request failed (${res.status})`
      )
    );
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
