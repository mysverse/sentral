import "server-only";

import { fetchJsonOrThrow } from "lib/http";
import { cacheLife, cacheTag } from "next/cache";

export interface FeedbackEntry {
  date: string;
  type: string;
  username: string;
  userId: number;
  feedback: string;
  placeId: number;
}

export async function getFeedbackData(resource: string) {
  "use cache";
  cacheLife("rapid");
  cacheTag(`feedback:${resource}`);

  const feedbackUrl = process.env.FEEDBACK_URL;
  if (!feedbackUrl) {
    throw new Error("Feedback URL is not configured.");
  }
  const url = new URL(feedbackUrl);
  url.searchParams.set("type", resource);
  if (resource === "Ban Appeal") {
    url.searchParams.set("limit", "0");
  }
  return fetchJsonOrThrow<FeedbackEntry[]>(url, { service: "feedback" });
}
