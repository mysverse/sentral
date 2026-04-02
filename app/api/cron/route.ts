import { NextRequest } from "next/server";
import { updateRobloxToClerkMap } from "utils/finsys";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await updateRobloxToClerkMap();
  return Response.json({ success: true, cache: results });
}
