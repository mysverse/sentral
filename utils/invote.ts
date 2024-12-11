import "server-only";

export interface ConstituencyData {
  constituencyCode: string;
  username: string;
  party: string;
  userId?: string;
  displayName?: string;
  shadowCabinet?: string;
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
  });
  if (response.ok) {
    const data: ConstituencyData[] = await response.json();
    return data;
  }
  return undefined;
}
