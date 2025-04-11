import { cache } from "react";
import { getGroups } from "utils/sim";

const groupResources = [
  {
    // MYSverse Moderation
    id: 35006850,
    rank: 1,
    resources: ["Ban Appeal"]
  },
  {
    // Hornbill Interactive
    id: 5674011,
    rank: 3,
    resources: ["Game Suggestion", "Game Bug Report"]
  },
  {
    // MYSverse Administration
    id: 1143446,
    rank: 252,
    resources: [
      "Game Suggestion",
      "Game Bug Report",
      "Ban Appeal",
      "Other Feedback"
    ]
  }
];

export const getFeedbackResources = cache(async (userId: number) => {
  const groups = await getGroups(userId);

  const resources = groups.data
    .filter((group) =>
      groupResources.some(
        (allowedGroup) =>
          group.group.id === allowedGroup.id &&
          group.role.rank >= allowedGroup.rank
      )
    )
    .flatMap((group) => {
      const allowedGroup = groupResources.find(
        (allowedGroup) => group.group.id === allowedGroup.id
      );
      return allowedGroup ? allowedGroup.resources : [];
    });

  return [...new Set(resources)];
});
