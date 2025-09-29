"use server";
import "server-only";

import { revalidatePath } from "next/cache";
import {
  certificateSchema,
  checkPermissions,
  deleteGenericCertificate,
  generateGenericCertificate,
  courseSchema,
  createCourse,
  deleteCourse,
  batchSchema,
  createBatch,
  deleteBatch,
  apiKeySchema,
  createApiKey,
  deleteApiKey
} from "./utils";

type BulkCertificatePayload = {
  index?: number;
  recipientName: string;
  identifier: string;
  type: string;
  robloxUserID?: string;
  recipientUserID?: string;
  externalOrg?: string;
  reason?: string;
};

type BulkCertificateResult = {
  successCount: number;
  failureCount: number;
  successes: Array<{
    index: number;
    recipientName: string;
    identifier: string;
    code: string;
    type: string;
  }>;
  failures: Array<{
    index: number;
    recipientName: string;
    identifier?: string;
    type?: string;
    error: string;
  }>;
};

async function validatePermissions() {
  const authorised = await checkPermissions();
  if (!authorised) {
    throw new Error("Unauthorized");
  }
}

function getIndex(entry: BulkCertificatePayload, fallback: number) {
  return typeof entry.index === "number" && !Number.isNaN(entry.index)
    ? entry.index
    : fallback;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function generateBulkCertificates(
  formData: FormData
): Promise<BulkCertificateResult> {
  await validatePermissions();

  const courseId = formData.get("courseId");
  const entriesRaw = formData.get("entries");

  if (typeof courseId !== "string" || !courseId.trim()) {
    throw new Error("Course selection is required");
  }

  if (typeof entriesRaw !== "string" || !entriesRaw.trim()) {
    throw new Error("No bulk entries provided");
  }

  let entries: BulkCertificatePayload[] = [];

  try {
    const parsed = JSON.parse(entriesRaw);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid bulk entries payload");
    }
    entries = parsed;
  } catch {
    throw new Error("Bulk entries payload is malformed");
  }

  if (entries.length === 0) {
    throw new Error("No valid entries provided");
  }

  const successes: BulkCertificateResult["successes"] = [];
  const failures: BulkCertificateResult["failures"] = [];

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const fallbackIndex = i + 1;
    const payloadIndex = getIndex(entry, fallbackIndex);

    const parsed = certificateSchema.safeParse({
      recipientName: entry.recipientName,
      courseId,
      identifier:
        typeof entry.identifier === "string"
          ? entry.identifier
          : String(entry.identifier ?? ""),
      type: entry.type,
      robloxUserID: entry.robloxUserID,
      recipientUserID: entry.recipientUserID,
      externalOrg: entry.externalOrg,
      reason: entry.reason
    });

    if (!parsed.success) {
      const errorMessage = parsed.error.issues
        .map((issue) => issue.message)
        .join(", ");
      failures.push({
        index: payloadIndex,
        recipientName: entry.recipientName,
        identifier:
          typeof entry.identifier === "string"
            ? entry.identifier
            : String(entry.identifier ?? ""),
        type: entry.type,
        error: errorMessage || "Invalid data"
      });
      continue;
    }

    try {
      const code = await generateGenericCertificate(parsed.data);
      successes.push({
        index: payloadIndex,
        recipientName: entry.recipientName,
        identifier: parsed.data.identifier,
        code,
        type: parsed.data.type
      });
    } catch (error) {
      const baseMessage = isUniqueConstraintError(error)
        ? "A certificate with this identifier already exists for the selected course and type."
        : error instanceof Error
          ? error.message
          : "Failed to create certificate";

      failures.push({
        index: payloadIndex,
        recipientName: entry.recipientName,
        identifier:
          typeof entry.identifier === "string"
            ? entry.identifier
            : String(entry.identifier ?? ""),
        type: entry.type,
        error: baseMessage
      });
    }
  }

  revalidatePath("/dashboard/certifier");

  return {
    successCount: successes.length,
    failureCount: failures.length,
    successes,
    failures
  };
}

export async function generateCertificate(formData: FormData) {
  await validatePermissions();
  const parsedData = certificateSchema.parse({
    recipientName: formData.get("recipientName"),
    courseId: formData.get("courseId"),
    identifier: formData.get("identifier"),
    type: formData.get("type"),
    robloxUserID: formData.get("robloxUserID") || undefined,
    recipientUserID: formData.get("recipientUserID") || undefined,
    externalOrg: formData.get("externalOrg") || undefined,
    reason: formData.get("reason") || undefined
  });
  await generateGenericCertificate(parsedData);
  revalidatePath("/dashboard/certifier");
}

export async function deleteCertificate(id: string) {
  await validatePermissions();
  await deleteGenericCertificate(id);
  revalidatePath("/dashboard/certifier");
}

// Actions for Courses
export async function createCourseAction(formData: FormData) {
  await validatePermissions();
  const parsedData = courseSchema.parse({
    name: formData.get("name"),
    description: formData.get("description")
  });
  await createCourse(parsedData);
  revalidatePath("/dashboard/certifier");
}

export async function deleteCourseAction(id: string) {
  await validatePermissions();
  await deleteCourse(id);
  revalidatePath("/dashboard/certifier");
}

// Actions for Batches
export async function createBatchAction(formData: FormData) {
  await validatePermissions();
  const parsedData = batchSchema.parse({
    name: formData.get("name"),
    courseId: formData.get("courseId")
  });
  await createBatch(parsedData);
  revalidatePath("/dashboard/certifier");
}

export async function deleteBatchAction(id: string) {
  await validatePermissions();
  await deleteBatch(id);
  revalidatePath("/dashboard/certifier");
}

// Actions for API Keys
export async function createApiKeyAction(formData: FormData): Promise<string> {
  await validatePermissions();
  const parsedData = apiKeySchema.parse({
    courseId: formData.get("courseId")
  });
  const data = await createApiKey(parsedData);
  revalidatePath("/dashboard/certifier");
  return data.key;
}

export async function deleteApiKeyAction(id: string) {
  await validatePermissions();
  await deleteApiKey(id);
  revalidatePath("/dashboard/certifier");
}
