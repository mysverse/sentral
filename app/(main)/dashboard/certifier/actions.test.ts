import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateTag: vi.fn(),
  checkPermissions: vi.fn(),
  generateGenericCertificate: vi.fn(),
  certificateSchema: {
    parse: vi.fn()
  }
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag
}));
vi.mock("./utils", () => ({
  certificateSchema: mocks.certificateSchema,
  checkPermissions: mocks.checkPermissions,
  createCertificatesBulk: vi.fn(),
  deleteGenericCertificate: vi.fn(),
  findExistingCertificateKeys: vi.fn(),
  generateGenericCertificate: mocks.generateGenericCertificate,
  courseSchema: { parse: vi.fn() },
  createCourse: vi.fn(),
  deleteCourse: vi.fn(),
  batchSchema: { parse: vi.fn() },
  createBatch: vi.fn(),
  deleteBatch: vi.fn(),
  apiKeySchema: { parse: vi.fn() },
  createApiKey: vi.fn(),
  deleteApiKey: vi.fn(),
  certifierTags: {
    certificates: "certifier:certificates",
    courses: "certifier:courses",
    batches: "certifier:batches",
    apiKeys: "certifier:api-keys",
    certificate: (code: string) => `certifier:certificate:${code}`
  }
}));

import { generateCertificate } from "./actions";

describe("certificate cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkPermissions.mockResolvedValue(true);
    mocks.certificateSchema.parse.mockReturnValue({
      recipientName: "Recipient",
      courseId: "course_1",
      identifier: "identifier_1",
      type: "PARTICIPATION"
    });
    mocks.generateGenericCertificate.mockResolvedValue("ABC123");
  });

  it("invalidates the list and exact certificate after issuance", async () => {
    await generateCertificate(new FormData());

    expect(mocks.updateTag).toHaveBeenCalledWith("certifier:certificates");
    expect(mocks.updateTag).toHaveBeenCalledWith(
      "certifier:certificate:ABC123"
    );
  });
});
