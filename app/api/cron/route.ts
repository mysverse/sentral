import { NextRequest } from "next/server";
import { updateRobloxToClerkMap } from "utils/finsys";
import { AppError, toApiError } from "lib/errors";
import { secureCompare } from "lib/secureCompare";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      toApiError(
        new AppError("CRON_SECRET not configured", { kind: "config" })
      ),
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!secureCompare(authHeader, `Bearer ${cronSecret}`)) {
    return Response.json(
      toApiError(new AppError("Invalid cron secret", { kind: "auth" })),
      { status: 401 }
    );
  }

  const results = await updateRobloxToClerkMap();
  return Response.json({ success: true, ...results });
}
