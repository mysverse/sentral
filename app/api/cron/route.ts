import { updateRobloxToClerkMap } from "utils/finsys";

export async function GET() {
  const results = await updateRobloxToClerkMap();
  return Response.json({ success: true, cache: results });
}
