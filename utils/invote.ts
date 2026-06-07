import { endpoints } from "components/constants/endpoints";
import { InvoteSeats } from "components/fetcher";
import { readJsonSafe } from "lib/http";

export interface ConstituencyData {
  constituencyCode: string;
  username: string;
  party: string;
  userId?: string;
  displayName?: string;
  shadowCabinet?: string;
}

export async function getInvoteSeats(series: string) {
  const url = `${endpoints.invote}/stats/seats/${encodeURIComponent(series)}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = (await readJsonSafe(response)) as InvoteSeats[];
    return data;
  }
  return undefined;
}

export async function getConstituencyData(series?: string) {
  const url = new URL(`https://mysverse-election.yan3321.workers.dev/`);
  if (series) {
    url.pathname += encodeURIComponent(series);
  }
  const response = await fetch(url, {
    next: {
      revalidate: 60
    }
  } as RequestInit);
  if (response.ok) {
    const data = (await readJsonSafe(response)) as ConstituencyData[];
    return data;
  }
  return undefined;
}

export function getCodeFromIndex(index: number) {
  return `P${String(index).padStart(2, "0")}`;
}
