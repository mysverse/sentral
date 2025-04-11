import { Avatar } from "components/catalyst/avatar";
import { getAvatarThumbnails } from "components/fetcher";
import { LocalTime } from "components/LocalTime";
import { Motion } from "components/motion";

export default async function Page() {
  const feedbackUrl = process.env.FEEDBACK_URL;

  if (!feedbackUrl) {
    return <div>Feedback URL is not configured.</div>;
  }

  const url = new URL(feedbackUrl);

  url.searchParams.set("type", "Ban Appeal");
  url.searchParams.set("limit", "200");

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

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-white">Feedback</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((feedback) => {
          const avatar = avatars.find(
            (avatar) => avatar.targetId === feedback.userId
          );
          return (
            <Motion
              key={`${feedback.userId}-${feedback.date}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="mb-4 flex items-center">
                {avatar && (
                  <Avatar src={avatar.imageUrl} className="mr-4 size-12" />
                )}
                <div>
                  <p className="font-semibold">@{feedback.username}</p>
                  <p className="text-sm text-gray-500">{feedback.userId}</p>
                </div>
              </div>
              <LocalTime
                date={new Date(feedback.date)}
                type={"distance"}
                className="mb-2 text-sm text-gray-500"
              />
              <p className="mb-2 text-sm text-gray-500">{feedback.type}</p>
              <p className="text-gray-700">{feedback.feedback}</p>
            </Motion>
          );
        })}
      </div>
    </div>
  );
}
