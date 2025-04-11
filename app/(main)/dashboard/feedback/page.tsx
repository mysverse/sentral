import { Avatar } from "components/catalyst/avatar";
import { getAvatarThumbnails } from "components/fetcher";
import { LocalTime } from "components/LocalTime";
import { Motion } from "components/motion";
import Link from "next/link";

export default async function Page() {
  const feedbackUrl = process.env.FEEDBACK_URL;

  if (!feedbackUrl) {
    return <div>Feedback URL is not configured.</div>;
  }

  const url = new URL(feedbackUrl);

  url.searchParams.set("type", "Ban Appeal");
  url.searchParams.set("limit", "0");

  const response = await fetch(url);

  interface Feedback {
    date: string;
    type: string;
    username: string;
    userId: number;
    feedback: string;
    placeId: number;
  }

  const data: Feedback[] = await response.json();

  const avatars = await getAvatarThumbnails(
    data.map((feedback) => feedback.userId),
    undefined,
    "bust"
  );

  if (data.length === 0) {
    return <div>No feedback available.</div>;
  }

  const keywords = [
    "ban",
    "ban appeal",
    "banappeal",
    "ban-appeal",
    "kick",
    "blacklist",
    "unban",
    "user",
    "name",
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

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">Feedback</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data
          .filter((feedback) => {
            const lowerFeedback = feedback.feedback.toLowerCase();
            return keywords.some((keyword) => lowerFeedback.includes(keyword));
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
                <Motion
                  className="group h-full w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:border-0 hover:bg-blue-600 hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="mb-4 flex items-center">
                    {avatar && (
                      <Avatar src={avatar.imageUrl} className="mr-4 size-12" />
                    )}
                    <div>
                      <p className="font-semibold">@{feedback.username}</p>
                      <p className="text-sm opacity-50 group-hover:opacity-70">
                        {placeNames.find(
                          (place) => place.id === feedback.placeId
                        )?.name ?? `MYSverse - ${feedback.placeId}`}
                      </p>
                    </div>
                  </div>
                  <LocalTime
                    date={new Date(feedback.date)}
                    type={"distance"}
                    className="mb-2 text-sm opacity-50 group-hover:opacity-70"
                  />
                  <p className="mb-2 text-sm opacity-50 group-hover:opacity-70">
                    {feedback.type}
                  </p>
                  <p className="overflow-hidden text-ellipsis opacity-70 group-hover:opacity-100">
                    {feedback.feedback}
                  </p>
                </Motion>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
