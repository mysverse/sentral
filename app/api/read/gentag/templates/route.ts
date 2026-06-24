import { getNametagTemplates } from "lib/data/gentag";
import { readResponse } from "lib/readResponse";

export async function GET() {
  return readResponse(
    await getNametagTemplates(),
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
}
