import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hmget: vi.fn(),
  hset: vi.fn()
}));

vi.mock("lib/redis", () => ({
  safeRedisHmget: mocks.hmget,
  safeRedisHset: mocks.hset
}));

vi.mock("lib/http", () => ({
  fetchJsonOrThrow: vi.fn(),
  readJsonSafe: (response: Response) => response.json(),
  THUMBNAIL_TIMEOUT: 1_000
}));

vi.mock("lib/errors", () => ({
  logAppError: vi.fn(),
  toAppError: (error: unknown) => error
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn()
}));

import { getAvatarThumbnails } from "./fetcher";

describe("avatar cache reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches only missing IDs and preserves normalized result order", async () => {
    mocks.hmget.mockResolvedValue([
      {
        targetId: 1,
        state: "Completed",
        imageUrl: "https://example.test/1"
      },
      null,
      {
        targetId: 3,
        state: "Completed",
        imageUrl: "https://example.test/3"
      }
    ]);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        data: [
          {
            targetId: 2,
            state: "Completed",
            imageUrl: "https://example.test/2"
          }
        ]
      })
    );

    await expect(getAvatarThumbnails([3, 2, 1, 2])).resolves.toEqual([
      expect.objectContaining({ targetId: 1 }),
      expect.objectContaining({ targetId: 2 }),
      expect.objectContaining({ targetId: 3 })
    ]);

    const proxyUrl = fetchMock.mock.calls[0][0] as URL;
    const upstreamUrl = new URL(proxyUrl.searchParams.get("apiurl")!);
    expect(upstreamUrl.searchParams.get("userIds")).toBe("2");
    expect(mocks.hset).toHaveBeenCalledWith(
      "cache:v2:avatars:headshot:100",
      {
        "2": expect.objectContaining({ targetId: 2 })
      },
      { ttlSeconds: 60 * 60 }
    );
  });
});
