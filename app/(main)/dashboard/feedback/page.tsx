import clsx from "clsx";
import Link from "next/link";

import { Avatar } from "components/catalyst/avatar";
import { InlineUnavailable } from "components/errorState";
import { getAvatarThumbnails } from "components/fetcher";
import { LocalTime } from "components/LocalTime";
import * as motion from "motion/react-client";
import { fetchJsonResult } from "lib/http";
import { getFeedbackResources } from "utils/feedback";
import { getUserId } from "utils/user";

const banKeywords = [
  "ban",
  "ban appeal",
  "banappeal",
  "ban-appeal",
  "kick",
  "blacklist",
  "unban",
  "diban",
  "user",
  "name",
  "nama",
  "player",
  "appeal"
];

const placeNames = [
  {
    id: 4892731894,
    name: "Lebuhraya"
  },
  {
    id: 481538620,
    name: "Bandaraya"
  },
  {
    id: 1845514014,
    name: "SMK MYS"
  },
  {
    id: 15236614529,
    name: "Feedback Centre"
  }
];

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type Props = {
  params: Params;
  searchParams: SearchParams;
};

export default async function Page(props: Props) {
  const feedbackUrl = process.env.FEEDBACK_URL;

  if (!feedbackUrl) {
    return <div>Feedback URL is not configured.</div>;
  }

  const searchParams = await props.searchParams;
  const userId = await getUserId();

  if (!userId) {
    return <div>User not authenticated.</div>;
  }

  const resources = await getFeedbackResources(userId);

  const url = new URL(feedbackUrl);

  let resource = resources[0];

  if (searchParams.resource && typeof searchParams.resource === "string") {
    resource = searchParams.resource;
  }

  if (resources.includes(resource) === false) {
    return <div>You do not have access to this resource.</div>;
  }

  url.searchParams.set("type", resource);

  if (resource === "Ban Appeal") {
    url.searchParams.set("limit", "0");
  }

  interface Feedback {
    date: string;
    type: string;
    username: string;
    userId: number;
    feedback: string;
    placeId: number;
  }

  const result = await fetchJsonResult<Feedback[]>(url, {
    service: "feedback"
  });

  if (!result.ok) {
    return (
      <InlineUnavailable label="Feedback is temporarily unavailable. Please try again later." />
    );
  }

  const data = Array.isArray(result.data) ? result.data : [];

  const avatars = await getAvatarThumbnails(
    data.map((feedback) => feedback.userId),
    undefined,
    "bust"
  );

  return (
    <div>
      <div className="bg-surface flex w-full items-center justify-around rounded-lg p-4 text-center shadow-sm">
        {resources.map((r) => (
          <Link
            key={r}
            href={`/dashboard/feedback?resource=${r}`}
            className={clsx(
              "mr-4 inline-block text-base font-semibold transition",
              resource === r
                ? "text-primary-600 hover:text-strong"
                : "text-strong hover:text-primary-600"
            )}
          >
            {r}
          </Link>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data
          .filter((feedback) => {
            // Only include feedback from the last 6 months
            if (resource === "Ban Appeal") {
              const feedbackDate = new Date(feedback.date);
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (feedbackDate < sixMonthsAgo) {
                return false;
              }
              const lowerFeedback = feedback.feedback.toLowerCase();
              return banKeywords.some((keyword) =>
                lowerFeedback.includes(keyword)
              );
            }
            return true;
          })
          .map((feedback) => {
            const avatar = avatars.find(
              (avatar) => avatar.targetId === feedback.userId
            );
            return (
              <Link
                key={`${feedback.userId}-${feedback.date}`}
                href={`https://roblox.com/users/${feedback.userId}/profile`}
                target="_blank"
              >
                <motion.div
                  className="group border-edge bg-surface hover:bg-primary-600 h-full w-full rounded-lg border p-4 shadow-md transition hover:border-0 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="mb-4 flex items-center">
                    {avatar && (
                      <Avatar src={avatar.imageUrl} className="mr-4 size-12" />
                    )}
                    <div>
                      <p className="font-semibold">@{feedback.username}</p>
                      <LocalTime
                        date={new Date(feedback.date)}
                        type={"distance"}
                        className="block text-sm opacity-50 group-hover:opacity-70"
                      />
                    </div>
                  </div>
                  <p className="mb-2 text-sm opacity-50 group-hover:opacity-70">
                    {feedback.type}
                    {" - "}
                    {placeNames.find((place) => place.id === feedback.placeId)
                      ?.name ?? `MYSverse - ${feedback.placeId}`}
                  </p>
                  <p className="overflow-hidden text-ellipsis opacity-70 group-hover:opacity-100">
                    {feedback.feedback}
                  </p>
                </motion.div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
