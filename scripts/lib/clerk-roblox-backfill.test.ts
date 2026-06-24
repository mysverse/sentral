import { describe, expect, it } from "vitest";
import { validateIdentityMappingReplacement } from "./clerk-roblox-backfill";

describe("Clerk identity map replacement", () => {
  it("allows a production mapping set of comparable size", () => {
    expect(() => validateIdentityMappingReplacement(1230, 1200)).not.toThrow();
  });

  it("rejects an apparent Clerk and Redis environment mismatch", () => {
    expect(() => validateIdentityMappingReplacement(1230, 1)).toThrow(
      "Check that Clerk and Redis use the same production environment"
    );
  });

  it("allows initial deployments without an existing identity map", () => {
    expect(() => validateIdentityMappingReplacement(0, 1)).not.toThrow();
  });
});
