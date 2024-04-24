import { auth } from "auth";
import { getPendingRequests } from "utils/finsys";

export async function GET() {
  const session = await auth();

  if (session) {
    const data = await getPendingRequests(session.user.id);
    return Response.json(data);
  }

  return Response.json({ error: "Unauthorised!" }, { status: 401 });
}
