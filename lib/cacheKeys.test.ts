import { describe, expect, it } from "vitest";
import {
  avatarCacheKey,
  mergeCachedByNumericId,
  normalizeNumericIds
} from "./cacheKeys";

describe("cache key helpers", () => {
  it("normalizes numeric IDs for stable cache keys", () => {
    expect(normalizeNumericIds([3, 1, 3, -1, Number.NaN, 2])).toEqual([
      1, 2, 3
    ]);
  });

  it("separates avatar variants and sizes", () => {
    expect(avatarCacheKey("headshot", 100)).toBe(
      "cache:v2:avatars:headshot:100"
    );
    expect(avatarCacheKey("bust", 352)).toBe("cache:v2:avatars:bust:352");
  });

  it("merges cache hits and misses in requested order", () => {
    expect(
      mergeCachedByNumericId(
        [3, 1, 2],
        [{ id: 3 }, null, { id: 2 }],
        [{ id: 1 }],
        (item) => item.id
      )
    ).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });
});
