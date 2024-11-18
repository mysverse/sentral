import "server-only";
import prisma from "lib/prisma";
import { auth } from "auth";

const allowed = [
  "1055048", // yan3321
  "912854402" // MYS_Network
];

export async function getCertificates() {
  const data = await prisma.certificate.findMany();
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
