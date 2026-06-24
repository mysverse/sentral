import { describe, expect, it } from "vitest";
import {
  avatarReadKey,
  GENTAG_TEMPLATES_KEY,
  invoteSeatsKey,
  invoteStatsKey,
  MECS_READ_KEYS
} from "./readKeys";

describe("SWR read keys", () => {
  it("keeps server fallback and client request keys deterministic", () => {
    expect(invoteStatsKey("GE 25")).toBe(
      "/api/read/invote/stats?series=GE%2025"
    );
    expect(invoteSeatsKey("GE25")).toBe("/api/read/invote/seats?series=GE25");
    expect(avatarReadKey([1, 2], 100, "headshot")).toBe(
      "/api/read/avatars?ids=1,2&size=100&type=headshot"
    );
    expect(GENTAG_TEMPLATES_KEY).toBe("/api/read/gentag/templates");
    expect(Object.values(MECS_READ_KEYS)).toHaveLength(4);
  });
});
