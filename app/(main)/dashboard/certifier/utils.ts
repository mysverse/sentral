import "server-only";
import prisma from "lib/prisma";
import { auth } from "auth";

const allowed = [
  "1055048", // yan3321
  "912854402" // MYS_Network
];

export async function getCertificates() {
  const data = await prisma.certificate.findMany({
    // Include new fields in the query
    select: {
      id: true,
      recipientName: true,
      courseName: true,
      issueDate: true,
      code: true,
      type: true,
      robloxUserID: true,
      recipientUserID: true,
      externalOrg: true
    }
  });
  return data;
}

export async function getCertificate(id: string) {
  const data = await prisma.certificate.findUnique({
    where: { id }
  });
  return data;
}

export async function getCertificateByCode(code: string) {
  const data = await prisma.certificate.findUnique({
    where: { code }
  });
  return data;
}

export async function checkPermissions() {
  const session = await auth();
  const userId = session?.user.id;

  if (userId) {
    return allowed.includes(userId);
  }

  return false;
}
