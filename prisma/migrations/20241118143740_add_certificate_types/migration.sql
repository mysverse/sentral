/*
  Warnings:

  - Added the required column `type` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('ROLEPLAY', 'TEAM_RECOGNITION', 'EXTERNAL');

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "externalOrg" TEXT,
ADD COLUMN     "recipientUserID" TEXT,
ADD COLUMN     "robloxUserID" TEXT,
ADD COLUMN     "type" "CertificateType" NOT NULL;
