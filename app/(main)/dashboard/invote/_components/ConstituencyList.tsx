import { getAvatarThumbnails } from "components/fetcher";
import { ConstituencyData, getConstituencyData } from "utils/invote";
import { regionNames } from "data/invote";

import ConstituencyCard from "./ConstituencyCard";

import { Motion } from "components/motion";

export default async function ConstituencyList() {
  const data = await getConstituencyData();
  if (!data) {
    return null;
  }
  const userIds = data.map((d) => parseInt(d.userId));
  const thumbnails = await getAvatarThumbnails(userIds, 352, "headshot");

  // Define constituency codes from P01 to P30
  const constituencies = Array.from(
    { length: 30 },
    (_, i) => `P${String(i + 1).padStart(2, "0")}`
  );

  // Group contestants by constituencyCode
  const groupedData: { [key: string]: ConstituencyData[] } = {};
  constituencies.forEach((code) => {
    groupedData[code] = data
      .filter((d) => d.constituencyCode === code)
      .sort((a, b) => a.party.localeCompare(b.party));
  });

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {constituencies
        .filter((code) => groupedData[code].length > 0)
        .map((code) => (
          <Motion
            key={code}
            className="mb-6"
            initial={"hidden"}
            whileInView={"visible"}
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  when: "beforeChildren",
                  staggerChildren: 0.3
                }
              }
            }}
          >
            <div className="mb-4 flex flex-row space-x-2 text-lg font-semibold">
              <div className="flex flex-row items-center">
                <span className="rounded bg-gray-200 px-2 py-1 text-sm">
                  {code}
                </span>
              </div>
              <div>{regionNames[code]}</div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {groupedData[code].map((contestant) => {
                let thumbnail = thumbnails.find(
                  (t) => t.targetId === parseInt(contestant.userId)
                )?.imageUrl;

                if (thumbnail?.trim() === "") {
                  thumbnail = undefined;
                }

                return (
                  <Motion
                    key={contestant.userId}
                    variants={{
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          ease: "easeOut",
                          duration: 0.3
                        }
                      },
                      hidden: {
                        opacity: 0,
                        x: -16
                      }
                    }}
                  >
                    <ConstituencyCard
                      contestant={contestant}
                      thumbnail={thumbnail}
                    />
                  </Motion>
                );
              })}
            </div>
          </Motion>
        ))}
    </div>
  );
}
