// page.tsx
import { auth } from "auth";
import { getGroupRoles } from "utils/sim";
import MainClient from "./MainClient";

export const metadata = {
  title: "Simmer"
};

export default async function Page() {
  const session = await auth();

  const username = session?.user.name;
  const userId = session?.user.id ? parseInt(session.user.id) : undefined;

  if (!(userId && username)) {
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
