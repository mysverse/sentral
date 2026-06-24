import { auth } from "auth";
import { getGroupRoles } from "utils/sim";

export async function GET() {
  const session = await auth();
  const robloxId = session?.user.id;
  if (!robloxId) {
    return Response.json(
      { error: { code: "auth", message: "Roblox account required" } },
      {
        status: 401,
        headers: { "Cache-Control": "private, no-store" }
      }
    );
  }

  try {
    const groups = await getGroupRoles(Number(robloxId));
    return Response.json(
      {
        data: { authorised: groups.length > 0 },
        fetchedAt: new Date().toISOString()
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json(
      { data: { authorised: false }, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
