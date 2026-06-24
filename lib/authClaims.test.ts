import { describe, expect, it } from "vitest";
import { sessionFromClaims } from "./authClaims";

describe("sessionFromClaims", () => {
  it("returns null for signed-out requests", () => {
    expect(sessionFromClaims(null, {})).toBeNull();
  });

  it("returns a linked Roblox identity from compact claims", () => {
    expect(
      sessionFromClaims("user_123", {
        roblox_id: "1055048",
        roblox_username: "yan3321"
      })
    ).toEqual({
      user: {
        clerkId: "user_123",
        id: "1055048",
        name: "yan3321"
      }
    });
  });

  it("keeps authenticated users in an explicit unlinked state", () => {
    expect(sessionFromClaims("user_123", {})).toEqual({
      user: {
        clerkId: "user_123",
        id: undefined,
        name: "User"
      }
    });
  });
});
