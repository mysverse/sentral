export interface ConstituencyData {
  constituencyCode: string;
  username: string;
  party: string;
  userId?: string;
  displayName?: string;
  shadowCabinet?: string;
}

export function getCodeFromIndex(index: number) {
  return `P${String(index).padStart(2, "0")}`;
}
