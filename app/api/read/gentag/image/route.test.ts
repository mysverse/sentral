import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());

vi.mock("auth", () => ({ auth }));
vi.mock("components/constants/endpoints", () => ({
  endpoints: { gentag: "https://gentag.test" }
}));

import { GET } from "./route";

describe("GenTag image gateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a linked Roblox claim and never permits persistence", async () => {
    auth.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "https://sentral.test/api/read/gentag/image?name=Test&index=0"
      )
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });

  it("rejects oversized asset batches before contacting the upstream", async () => {
    auth.mockResolvedValue({
      user: { clerkId: "user_1", id: "1055048", name: "yan3321" }
    });
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const assetIds = Array.from(
      { length: 6 },
      (_, index) => `assetId=${index + 1}`
    ).join("&");

    const response = await GET(
      new Request(
        `https://sentral.test/api/read/gentag/image?name=Test&index=0&${assetIds}`
      )
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
