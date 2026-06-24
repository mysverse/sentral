export type RobloxSession = {
  user: {
    clerkId: string;
    id?: string;
    name: string;
  };
};

export function sessionFromClaims(
  userId: string | null | undefined,
  claims: Record<string, unknown> | null | undefined
): RobloxSession | null {
  if (!userId) {
    return null;
  }
  const robloxId =
    typeof claims?.roblox_id === "string" ? claims.roblox_id : undefined;
  const robloxUsername =
    typeof claims?.roblox_username === "string"
      ? claims.roblox_username
      : undefined;
  return {
    user: {
      clerkId: userId,
      id: robloxId,
      name: robloxUsername ?? "User"
    }
  };
}
