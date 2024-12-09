export interface ConstituencyData {
  constituencyCode: string;
  username: string;
  userId: string;
  shadowCabinet?: string;
  party: string;
}

export async function getConstituencyData() {
  const response = await fetch(
    `https://assets.mysver.se/participants_list_with_constituency.json`,
    {
      cache: "force-cache"
    }
  );
  if (response.ok) {
    const data: ConstituencyData[] = await response.json();
    return data;
  }
  return undefined;
}
