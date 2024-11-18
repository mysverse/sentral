"use server";
import "server-only";

import prisma from "lib/prisma";
import { revalidatePath } from "next/cache";
import { checkPermissions } from "./utils";
import { CertificateType } from "@prisma/client";

// Helper functions
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

async function validatePermissions() {
  const authorised = await checkPermissions();
  if (!authorised) {
    throw new Error("Unauthorized");
  }
}

export async function generateCertificate(formData: FormData) {
  await validatePermissions();

  const recipientName = formData.get("recipientName")?.toString();
  const courseName = formData.get("courseName")?.toString();
  const type = formData.get("type")?.toString() as CertificateType;
  const robloxUserID = formData.get("robloxUserID")?.toString();
  const recipientUserID = formData.get("recipientUserID")?.toString();
  const externalOrg = formData.get("externalOrg")?.toString();

  if (!recipientName || !courseName || !type) {
    throw new Error("Recipient Name, Course Name, and Type are required");
  }

  const code = generateUniqueCode();

  await prisma.certificate.create({
    data: {
      recipientName,
      courseName,
      type,
      code,
      robloxUserID: robloxUserID || null,
      recipientUserID: recipientUserID || null,
      externalOrg: externalOrg || null
    }
  });
  revalidatePath("/dashboard/certifier");
}

export async function deleteCertificate(id: string) {
  await validatePermissions();
  await prisma.certificate.delete({
    where: {
      id
    }
  });
  revalidatePath("/dashboard/certifier");
}
