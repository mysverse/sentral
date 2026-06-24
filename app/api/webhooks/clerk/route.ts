import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { safeRedisHdel, safeRedisHset } from "lib/redis";
import { NextRequest } from "next/server";
import { ROBLOX_CLERK_MAP_KEY } from "utils/finsys";

type ClerkUserPayload = {
  id: string;
  public_metadata?: Record<string, unknown>;
  external_accounts?: Array<{
    provider?: string;
    provider_user_id?: string;
    external_id?: string;
    username?: string | null;
  }>;
};

function getRobloxIdentity(user: ClerkUserPayload) {
  const account = user.external_accounts?.find(
    (candidate) => candidate.provider === "oauth_custom_roblox"
  );
  const id = account?.provider_user_id ?? account?.external_id;
  return id
    ? {
        id,
        username: account?.username ?? undefined
      }
    : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    if (event.type !== "user.created" && event.type !== "user.updated") {
      return Response.json({ success: true, ignored: true });
    }

    const user = event.data as ClerkUserPayload;
    const identity = getRobloxIdentity(user);
    const previousId =
      typeof user.public_metadata?.roblox_id === "string"
        ? user.public_metadata.roblox_id
        : undefined;

    if (previousId && previousId !== identity?.id) {
      await safeRedisHdel(ROBLOX_CLERK_MAP_KEY, [previousId]);
    }

    if (identity) {
      await safeRedisHset(ROBLOX_CLERK_MAP_KEY, {
        [identity.id]: user.id
      });
    }

    const existingUsername =
      typeof user.public_metadata?.roblox_username === "string"
        ? user.public_metadata.roblox_username
        : undefined;
    if (
      previousId !== identity?.id ||
      existingUsername !== identity?.username
    ) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          roblox_id: identity?.id ?? null,
          roblox_username: identity?.username ?? null
        }
      });
    }

    return Response.json({
      success: true,
      linked: Boolean(identity)
    });
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return Response.json(
      { error: { code: "invalid_webhook", message: "Invalid webhook" } },
      { status: 400 }
    );
  }
}
