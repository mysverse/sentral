"use server";
import "server-only";

import { auth } from "auth";
import { fetchJsonOrThrow } from "lib/http";
import { allowedGroups } from "data/sim";
import { cacheLife, cacheTag } from "next/cache";

interface RbxGroupResponse {
  data: RbxGroupData[];
}

export interface RbxGroupData {
  group: Group;
  role: Role;
}

interface Group {
  id: number;
  name: string;
  memberCount: number;
  hasVerifiedBadge: boolean;
}

interface Role {
  id: number;
  name: string;
  rank: number;
}

async function getUserData() {
  const session = await auth();

  if (!session) {
    throw new Error("No session found");
  }

  const username = session.user.name;
  const userId = parseInt(session.user.id!);

  if (!session?.user.id) throw new Error("Unauthorized");

  if (!username) {
    throw new Error("No username provided");
  }

  return {
    username,
    userId
  };
}

export async function getGroups(userId: number) {
  "use cache";
  cacheLife({
    stale: 60,
    revalidate: 5 * 60,
    expire: 30 * 60
  });
  cacheTag(`roblox:groups:${userId}`);
  return fetchJsonOrThrow<RbxGroupResponse>(
    `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
    { service: "roblox-groups" }
  );
}

export async function getGroupRoles(userId: number) {
  const groups = await getGroups(userId);
  return groups.data.filter((group) =>
    allowedGroups.find(
      (allowedGroup) =>
        allowedGroup.id === group.group.id &&
        group.role.rank >= allowedGroup.minRank
    )
  );
}

const apiKey = process.env.EMAIL_ISSUER_API_KEY;

interface EmailCreateResponse {
  success: boolean;
  message?: string;
  email?: string;
  password?: string;
}

interface EmailCheckResponse {
  exists: boolean;
  email?: string;
}

interface EmailResetResponse {
  success: boolean;
  email?: string;
  password?: string;
}

export async function createEmail() {
  if (!apiKey) throw new Error("No API key provided");
  const { userId, username } = await getUserData();
  const url = new URL(
    "https://mysverse-email-issuer.yan3321.workers.dev/create"
  );
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("username", username);
  return await fetchJsonOrThrow<EmailCreateResponse>(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    },
    service: "email-issuer"
  });
}

export async function resetEmail() {
  if (!apiKey) throw new Error("No API key provided");
  const { userId, username } = await getUserData();
  const url = new URL(
    "https://mysverse-email-issuer.yan3321.workers.dev/reset_password"
  );
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("username", username);
  return await fetchJsonOrThrow<EmailResetResponse>(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    },
    service: "email-issuer"
  });
}

export async function checkEmail() {
  if (!apiKey) throw new Error("No API key provided");
  const { userId, username } = await getUserData();
  const url = new URL(
    "https://mysverse-email-issuer.yan3321.workers.dev/check"
  );
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("username", username);
  return await fetchJsonOrThrow<EmailCheckResponse>(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    },
    service: "email-issuer"
  });
}
