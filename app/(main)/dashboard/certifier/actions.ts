"use server";
import "server-only";

import prisma from "lib/prisma";
import { pdf } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import { renderCertificateById } from "./certificates";
import { checkPermissions } from "./utils";

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
  // Register your custom font if needed

  const recipientName = formData.get("recipientName")?.toString();
  const courseName = formData.get("courseName")?.toString();

  if (!recipientName || !courseName) {
    throw new Error("Recipient Name and Course Name are required");
  }

  // Generate a unique code
  const code = generateUniqueCode();

  // Create PDF certificate using React-PDF and Tailwind CSS

  // Save certificate data to the database
  await prisma.certificate.create({
    data: {
      recipientName,
      courseName,
      code
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
