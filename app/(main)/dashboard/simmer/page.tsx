// page.tsx
import { auth } from "auth";
import { getGroupRoles } from "utils/sim";
import MainClient from "./MainClient";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return null; // Or redirect to login
  }

  const username = session.user.name;
  const userId = parseInt(session.user.id);

  if (!username) {
    return null; // Or redirect to login
  }

  const groups = await getGroupRoles(userId);
  const authorised = groups.length > 0;

  return (
    <MainClient
      authorised={authorised}
      groups={groups}
      userId={userId}
      username={username}
    />
  );
}
