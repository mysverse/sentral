export const MECS_READ_KEYS = {
  staff: "/api/read/mecs/staff",
  caseStats: "/api/read/mecs/case",
  audit: "/api/read/mecs/audit",
  blacklist: "/api/read/mecs/blacklist"
} as const;

export const GENTAG_TEMPLATES_KEY = "/api/read/gentag/templates";

export const invoteStatsKey = (series: string) =>
  `/api/read/invote/stats?series=${encodeURIComponent(series)}`;

export const invoteSeatsKey = (series: string) =>
  `/api/read/invote/seats?series=${encodeURIComponent(series)}`;

export const avatarReadKey = (
  ids: number[],
  size: number,
  type: "headshot" | "bust"
) => `/api/read/avatars?ids=${ids.join(",")}&size=${size}&type=${type}`;
