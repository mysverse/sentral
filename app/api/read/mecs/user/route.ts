import { getMecsUser } from "lib/data/mecs";
import { readResponse } from "lib/readResponse";
import { z } from "zod";

const querySchema = z.object({
  query: z.string().trim().min(1).max(32),
  type: z.enum(["name", "id"]).default("name")
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    query: url.searchParams.get("query"),
    type: url.searchParams.get("type") ?? "name"
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "validation", message: "Invalid user query" } },
      { status: 400 }
    );
  }
  const query =
    parsed.data.type === "name"
      ? parsed.data.query.toLowerCase()
      : parsed.data.query;
  const data = await getMecsUser(query, parsed.data.type === "id");
  return readResponse(data, "public, s-maxage=300, stale-while-revalidate=300");
}
