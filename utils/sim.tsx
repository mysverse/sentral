"use server";
import "server-only";

import { auth } from "auth";

interface RbxGroupResponse {
  data: Datum[];
}

interface Datum {
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

const allowedGroups = [
  {
    id: 2817134,
    minRank: 1
  },
  {
    id: 2817130,
    minRank: 1
  },
  {
    id: 2849945,
    minRank: 1
  },
  {
    id: 1182710,
    minRank: 1
  },
  {
    id: 2868511,
    minRank: 1
  },
  {
    id: 2957304,
    minRank: 1
  },
  {
    id: 5760632,
    minRank: 1
  },
  {
    // Public Services
    id: 7919369,
    minRank: 1
  },
  {
    // Istana MYSverse
    id: 16602842,
    minRank: 1
  },
  {
    // MYSverse Administration
    id: 1143446,
    minRank: 252
  }
];

async function getUserData() {
  const session = await auth();

  if (!session) {
    throw new Error("No session found");
  }

  const username = session.user.name;
  const userId = parseInt(session.user.id);

  if (!username) {
    throw new Error("No username provided");
  }

  return {
    username,
    userId
  };
}

export async function getGroups(userId: number) {
  const response = await fetch(
    `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
    { next: { revalidate: 60 } }
  );
  const data: RbxGroupResponse = await response.json();
  return data;
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
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    }
  });
  const data: EmailCreateResponse = await response.json();
  return data;
}

export async function resetEmail() {
  if (!apiKey) throw new Error("No API key provided");
  const { userId, username } = await getUserData();
  const url = new URL(
    "https://mysverse-email-issuer.yan3321.workers.dev/reset_password"
  );
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("username", username);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    }
  });
  const data: EmailResetResponse = await response.json();
  return data;
}

export async function checkEmail() {
  if (!apiKey) throw new Error("No API key provided");
  const { userId, username } = await getUserData();
  const url = new URL(
    "https://mysverse-email-issuer.yan3321.workers.dev/check"
  );
  url.searchParams.append("userId", userId.toString());
  url.searchParams.append("username", username);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    }
  });
  const data: EmailCheckResponse = await response.json();
  return data;
}
