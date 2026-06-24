import { auth as clerkAuth } from "@clerk/nextjs/server";
import { sessionFromClaims } from "lib/authClaims";

export async function auth() {
  const { userId, sessionClaims } = await clerkAuth();
  return sessionFromClaims(userId, sessionClaims);
}
