import { getAvatarThumbnails } from "components/fetcher";
import { ConstituencyData } from "utils/invote";
import { regionNames } from "data/invote";

import ConstituencyCard from "./ConstituencyCard";

export default async function ConstituencyList({
  data
}: {
  data: ConstituencyData[];
}) {
  const userIds = data.map((d) => parseInt(d.userId));
  const thumbnails = await getAvatarThumbnails(userIds, 420);

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

  let index = 0;

  return (
    <div className="mb-8 rounded-lg bg-white px-5 py-6 shadow sm:px-6">
      <h1 className="mb-2 text-xl font-bold">GE22 Candidates</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {constituencies.map((code) => (
          <div key={code} className="mb-6">
            <h2 className="mb-4 text-lg font-semibold">
              {code} - {regionNames[code]}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {groupedData[code].map((contestant) => {
                const thumbnail =
                  thumbnails.data.find(
                    (t) => t.targetId === parseInt(contestant.userId)
                  )?.imageUrl || "";
                return (
                  <ConstituencyCard
                    key={contestant.userId}
                    contestant={contestant}
                    thumbnail={thumbnail}
                    index={index++}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
