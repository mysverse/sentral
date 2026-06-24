import { getAvatarThumbnails } from "components/fetcher";
import { readResponse } from "lib/readResponse";
import { z } from "zod";
import { normalizeNumericIds } from "lib/cacheKeys";

const querySchema = z.object({
  ids: z
    .string()
    .transform((value) => normalizeNumericIds(value.split(",").map(Number)))
    .refine((ids) => ids.length <= 100),
  size: z.coerce.number().int().min(48).max(420).default(100),
  type: z.enum(["headshot", "bust"]).default("headshot")
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    ids: url.searchParams.get("ids") ?? "",
    size: url.searchParams.get("size") ?? "100",
    type: url.searchParams.get("type") ?? "headshot"
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "validation", message: "Invalid avatar request" } },
      { status: 400 }
    );
  }
  const data = await getAvatarThumbnails(
    parsed.data.ids,
    parsed.data.size,
    parsed.data.type
  );
  return readResponse(data, "public, s-maxage=60, stale-while-revalidate=3600");
}
