import {
  getInvoteCandidates,
  getInvoteSeatStats,
  getInvoteSeries,
  getInvoteStats
} from "lib/data/invote";
import { readResponse } from "lib/readResponse";
import { z } from "zod";

const resourceSchema = z.enum(["series", "stats", "seats", "candidates"]);
const seriesSchema = z.string().trim().min(1).max(32);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const resource = resourceSchema.safeParse((await params).resource);
  if (!resource.success) {
    return Response.json(
      { error: { code: "validation", message: "Unknown inVote resource" } },
      { status: 404 }
    );
  }
  if (resource.data === "series") {
    return readResponse(
      await getInvoteSeries(),
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
  }

  const parsedSeries = seriesSchema.safeParse(
    new URL(request.url).searchParams.get("series")
  );
  if (!parsedSeries.success) {
    return Response.json(
      { error: { code: "validation", message: "Invalid election series" } },
      { status: 400 }
    );
  }

  const data =
    resource.data === "stats"
      ? await getInvoteStats(parsedSeries.data)
      : resource.data === "seats"
        ? await getInvoteSeatStats(parsedSeries.data)
        : await getInvoteCandidates(parsedSeries.data);
  return readResponse(
    data,
    resource.data === "candidates"
      ? "public, s-maxage=3600, stale-while-revalidate=86400"
      : "public, s-maxage=15, stale-while-revalidate=300"
  );
}
