import { currentUser } from "@clerk/nextjs/server";

export async function auth() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const robloxAccount = user?.externalAccounts?.find(
    (account) => account.provider === "oauth_custom_roblox"
  );
  return {
    user: {
      clerkId: user.id,
      id: robloxAccount?.externalId,
      image: robloxAccount?.imageUrl ?? user.imageUrl,
      name:
        robloxAccount?.username ??
        user.primaryEmailAddress?.emailAddress ??
        "User"
    }
  };
}
