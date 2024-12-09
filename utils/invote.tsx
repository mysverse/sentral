export interface ConstituencyData {
  constituencyCode: string;
  username: string;
  userId: string;
  shadowCabinet?: string;
  party: string;
}

export async function getConstituencyData() {
  const response = await fetch(
    `https://mysverse-election.yan3321.workers.dev/`,
    {
      next: {
        revalidate: 60
      }
    }
  );
  if (response.ok) {
    const data: ConstituencyData[] = await response.json();
    return data;
  }
  return undefined;
}
