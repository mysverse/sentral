import "server-only";
import prisma from "lib/prisma";
import { auth } from "auth";
import { CertificateType } from "generated/client";
import { z } from "zod";

const allowed = [
  "1055048", // yan3321
  "912854402" // MYS_Network
];

export const certificateSchema = z.object({
  recipientName: z.string().nonempty("Recipient Name is required"),
  courseId: z.string().nonempty("Course ID is required"), // Changed from courseName
  identifier: z.string().nonempty("Identifier is required"), // Added
  type: z.enum(CertificateType, {
    error: "Invalid certificate type"
  }),
  robloxUserID: z.string().optional(),
  recipientUserID: z.string().optional(),
  externalOrg: z.string().optional()
});

// Schema for creating a new course
export const courseSchema = z.object({
  name: z.string().nonempty("Course Name is required"),
  description: z.string().optional()
});

// Schema for creating a new batch
export const batchSchema = z.object({
  name: z.string().nonempty("Batch Name is required"),
  courseId: z.string().nonempty("Course ID is required")
});

// Schema for creating a new API key
export const apiKeySchema = z.object({
  courseId: z.string().nonempty("Course ID is required")
});

export async function getCertificates() {
  const data = await prisma.certificate.findMany({
    select: {
      id: true,
      recipientName: true,
      issueDate: true,
      code: true,
      type: true,
      robloxUserID: true,
      recipientUserID: true,
      externalOrg: true,
      identifier: true, // Added
      course: {
        select: {
          name: true
        }
      },
      batch: {
        select: {
          name: true
        }
      }
    }
  });
  // Transform data to include courseName and batchName at the top level
  return data.map((cert) => ({
    ...cert,
    courseName: cert.course.name,
    batchName: cert.batch?.name // batch is optional
  }));
}

export async function getCertificateByCode(code?: string) {
  if (!code) {
    return null;
  }
  const data = await prisma.certificate.findUnique({
    where: { code },
    include: {
      // Changed from select to include to get full related models
      course: { select: { name: true } }, // Select only name from course
      batch: { select: { name: true } } // Select only name from batch
    }
  });

  if (data) {
    return {
      ...data,
      courseName: data.course.name,
      batchName: data.batch?.name // batch is optional
    };
  }
  return null;
}

export async function checkPermissions() {
  const session = await auth();
  const userId = session?.user.id;

  if (userId) {
    return allowed.includes(userId);
  }

  return false;
}

// Helper functions
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

export async function generateGenericCertificate(
  parsedSchema: z.infer<typeof certificateSchema>
) {
  const {
    recipientName,
    courseId, // Changed from courseName
    identifier, // Added
    type,
    robloxUserID,
    recipientUserID,
    externalOrg
  } = parsedSchema;

  // Basic validation, more specific checks can be added
  if (!recipientName || !courseId || !identifier || !type) {
    throw new Error(
      "Recipient Name, Course ID, Identifier, and Type are required"
    );
  }

  const uniqueCode = generateUniqueCode();

  // Prisma's unique constraint @@unique([courseId, identifier, type])
  // will prevent duplicate entries. If an attempt is made to create a
  // duplicate, Prisma will throw a P2002 error.
  await prisma.certificate.create({
    data: {
      recipientName,
      courseId, // Changed from courseName
      identifier, // Added
      type,
      code: uniqueCode,
      robloxUserID: robloxUserID || null,
      recipientUserID: recipientUserID || null,
      externalOrg: externalOrg || null
      // batchId can be added here if it's part of parsedSchema and needed
    }
  });

  return uniqueCode;
}

export async function deleteGenericCertificate(id: string) {
  await prisma.certificate.delete({
    where: {
      id
    }
  });
}

// Functions for Courses
export async function getCourses() {
  return prisma.course.findMany();
}

export async function createCourse(data: z.infer<typeof courseSchema>) {
  return prisma.course.create({ data });
}

export async function deleteCourse(id: string) {
  // Ensure related API Keys and Certificates are handled or cascade deletion is set up in Prisma schema
  // For now, we assume related Batches might need to be deleted or disassociated first if not cascaded
  await prisma.batch.deleteMany({ where: { courseId: id } });
  await prisma.apiKey.deleteMany({ where: { courseId: id } });
  await prisma.certificate.deleteMany({ where: { courseId: id } });
  return prisma.course.delete({ where: { id } });
}

// Functions for Batches
export async function getBatches() {
  return prisma.batch.findMany({
    include: {
      course: {
        select: { name: true }
      }
    }
  });
}

export async function createBatch(data: z.infer<typeof batchSchema>) {
  return prisma.batch.create({ data });
}

export async function deleteBatch(id: string) {
  // Ensure related Certificates are handled or cascade deletion is set up
  await prisma.certificate.deleteMany({ where: { batchId: id } });
  return prisma.batch.delete({ where: { id } });
}

// Functions for API Keys
export async function getApiKeys() {
  return prisma.apiKey.findMany({
    include: {
      course: {
        select: { name: true }
      }
    }
  });
}

function generateUniqueApiKey() {
  // A simple way to generate a more "API-key-like" string
  const prefix = "msk_"; // MySverse Key
  const randomPart =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return prefix + randomPart;
}

export async function createApiKey(data: z.infer<typeof apiKeySchema>) {
  const uniqueKey = generateUniqueApiKey();
  return prisma.apiKey.create({
    data: {
      ...data,
      key: uniqueKey,
      isActive: true // Default to active
    }
  });
}

export async function deleteApiKey(id: string) {
  return prisma.apiKey.delete({ where: { id } });
}
