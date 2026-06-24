import { endpoints } from "components/constants/endpoints";
import { auth } from "auth";
import { z } from "zod";

const querySchema = z.object({
  name: z.string().trim().min(1).max(12),
  index: z.coerce.number().int().min(0).max(100),
  preview: z.enum(["0", "1"]).default("0"),
  assetId: z.array(z.coerce.number().int().positive()).max(5).default([])
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user.id) {
    return Response.json(
      { error: { code: "auth", message: "Roblox account required" } },
      { status: 401, headers: { "Cache-Control": "private, no-store" } }
    );
  }
  const requestUrl = new URL(request.url);
  const parsed = querySchema.safeParse({
    name: requestUrl.searchParams.get("name"),
    index: requestUrl.searchParams.get("index"),
    preview: requestUrl.searchParams.get("preview") ?? "0",
    assetId: requestUrl.searchParams.getAll("assetId")
  });
  if (!parsed.success) {
    return Response.json(
      { error: { code: "validation", message: "Invalid nametag request" } },
      { status: 400, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const upstream = new URL(
    `${endpoints.gentag}/nametag/${
      parsed.data.preview === "1" ? "preview" : "create"
    }/${parsed.data.index}/${encodeURIComponent(parsed.data.name)}`
  );
  parsed.data.assetId.forEach((id) =>
    upstream.searchParams.append("assetId", String(id))
  );
  const response = await fetch(upstream, { cache: "no-store" });
  if (!response.ok) {
    return Response.json(
      { error: { code: "upstream", message: "Nametag generation failed" } },
      {
        status: response.status,
        headers: { "Cache-Control": "private, no-store" }
      }
    );
  }
  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "private, no-store"
    }
  });
}
