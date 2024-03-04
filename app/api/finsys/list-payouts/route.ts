import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { getPendingRequests } from "utils/finsys";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session) {
    const data = await getPendingRequests(session.user.id);
    return Response.json(data);
  }

  return Response.json({ error: "Unauthorised!" }, { status: 401 });
}
