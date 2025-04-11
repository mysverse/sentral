import { auth } from "auth";

export async function getUserId() {
  const session = await auth();
  const userIdString = session?.user.id;
  if (userIdString) {
    const userId = parseInt(userIdString);
    return userId;
  }
  return undefined;
}
