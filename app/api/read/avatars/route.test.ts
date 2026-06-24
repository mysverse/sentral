import { beforeEach, describe, expect, it, vi } from "vitest";

const getAvatarThumbnails = vi.hoisted(() => vi.fn());

vi.mock("components/fetcher", () => ({
  getAvatarThumbnails
}));

import { GET } from "./route";

describe("avatar read gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes IDs and returns the standard read envelope", async () => {
    getAvatarThumbnails.mockResolvedValue([
      { targetId: 1, state: "Completed", imageUrl: "https://example/1" },
      { targetId: 2, state: "Completed", imageUrl: "https://example/2" }
    ]);

    const response = await GET(
      new Request(
        "https://sentral.test/api/read/avatars?ids=2,1,2&size=100&type=headshot"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(getAvatarThumbnails).toHaveBeenCalledWith([1, 2], 100, "headshot");
    expect(payload.data).toHaveLength(2);
    expect(payload.fetchedAt).toEqual(expect.any(String));
  });

  it("rejects batches larger than 100 unique IDs", async () => {
    const ids = Array.from({ length: 101 }, (_, index) => index + 1).join(",");
    const response = await GET(
      new Request(`https://sentral.test/api/read/avatars?ids=${ids}`)
    );

    expect(response.status).toBe(400);
    expect(getAvatarThumbnails).not.toHaveBeenCalled();
  });
});
