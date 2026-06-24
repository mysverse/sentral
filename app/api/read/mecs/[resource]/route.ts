import {
  getMecsAuditStats,
  getMecsBlacklist,
  getMecsCaseStats,
  getMecsStaff
} from "lib/data/mecs";
import { readResponse } from "lib/readResponse";
import { z } from "zod";

const resourceSchema = z.enum(["staff", "case", "audit", "blacklist"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string }> }
) {
  const parsed = resourceSchema.safeParse((await params).resource);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "validation", message: "Unknown MECS resource" } },
      { status: 404 }
    );
  }

  const data =
    parsed.data === "staff"
      ? await getMecsStaff()
      : parsed.data === "case"
        ? await getMecsCaseStats()
        : parsed.data === "audit"
          ? await getMecsAuditStats()
          : await getMecsBlacklist();
  return readResponse(data);
}
