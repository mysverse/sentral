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

async function validatePermissions() {
  const authorised = await checkPermissions();
  if (!authorised) {
    throw new Error("Unauthorized");
  }
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
    externalOrg: formData.get("externalOrg") || undefined
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
