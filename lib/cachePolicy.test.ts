import { describe, expect, it } from "vitest";
import { simetricsCacheProfile } from "./cachePolicy";

describe("cache policy selection", () => {
  it("uses the rapid profile for the current Simetrics date", () => {
    expect(
      simetricsCacheProfile(
        "2026-06-25T02:00:00.000Z",
        "2026-06-25T14:00:00.000Z"
      )
    ).toBe("rapid");
  });

  it("uses the historical profile for older Simetrics dates", () => {
    expect(
      simetricsCacheProfile(
        "2026-06-24T23:59:59.000Z",
        "2026-06-25T00:00:00.000Z"
      )
    ).toBe("historical");
  });
});
