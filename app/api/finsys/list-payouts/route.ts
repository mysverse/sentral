import { auth } from "auth";
import { getPendingRequests, toApiError } from "utils/finsys";
import { NextResponse } from "next/server";

const privateHeaders = {
  "Cache-Control": "private, no-store"
};

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorised!" },
      { status: 401, headers: privateHeaders }
    );
  }

  try {
    const data = await getPendingRequests(session.user.id);
    return NextResponse.json(data, { headers: privateHeaders });
  } catch (error) {
    const apiError = toApiError(error);
    const status =
      apiError.error.code === "auth"
        ? 403
        : apiError.error.code === "config"
          ? 503
          : 500;
    return NextResponse.json(apiError, { status, headers: privateHeaders });
  }
}
