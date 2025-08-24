/*
  Warnings:

  - The values [PENDING,ACCEPTED,REJECTED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,COMPLETED,CANCELLED] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ONSITE] on the enum `Mode` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_REVIEW,ASSIGNED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SCHOOL,COLLEGE,UNIVERSITY,QURAN,PROJECT_HELP,OTHER] on the enum `RequestType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cover` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `expected` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `cityName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `isVisible` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `maxBudget` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `minBudget` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `modes` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `stateCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `useProfileContact` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Request` table. All the data in the column will be lost.
  - The primary key for the `StudentProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dob` on the `StudentProfile` table. All the data in the column will be lost.
  - The `educationLevel` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TutorProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hourlyMax` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyMin` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tagline` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `StudentProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TutorProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `EmailToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenHash` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'MIDDLE', 'MATRIC_SECONDARY', 'INTERMEDIATE', 'UNDERGRADUATE', 'GRADUATE', 'POSTGRADUATE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'FORWARDED_TO_STUDENT', 'ACCEPTED_BY_STUDENT', 'DECLINED_BY_STUDENT');
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentStatus_new" AS ENUM ('PENDING_TUTOR_ACCEPT', 'ACCEPTED', 'REJECTED');
ALTER TABLE "Assignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Assignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TYPE "AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "AssignmentStatus_old";
ALTER TABLE "Assignment" ALTER COLUMN "status" SET DEFAULT 'PENDING_TUTOR_ACCEPT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Mode_new" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
ALTER TABLE "Request" ALTER COLUMN "mode" TYPE "Mode_new" USING ("mode"::text::"Mode_new");
ALTER TYPE "Mode" RENAME TO "Mode_old";
ALTER TYPE "Mode_new" RENAME TO "Mode";
DROP TYPE "Mode_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('DRAFT', 'OPEN', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');
ALTER TABLE "Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestType_new" AS ENUM ('HIRE_TUTOR', 'HIRE_QURAN');
ALTER TABLE "Request" ALTER COLUMN "type" TYPE "RequestType_new" USING ("type"::text::"RequestType_new");
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";
DROP TYPE "RequestType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "EmailToken" DROP CONSTRAINT "EmailToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_userId_fkey";

-- DropIndex
DROP INDEX "Assignment_requestId_key";

-- DropIndex
DROP INDEX "EmailToken_tokenHash_type_expiresAt_idx";

-- DropIndex
DROP INDEX "EmailVerificationToken_token_idx";

-- DropIndex
DROP INDEX "EmailVerificationToken_token_key";

-- DropIndex
DROP INDEX "Notification_userId_readAt_idx";

-- DropIndex
DROP INDEX "OtpChallenge_email_idx";

-- DropIndex
DROP INDEX "OtpChallenge_reason_idx";

-- DropIndex
DROP INDEX "Request_studentId_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "cover",
DROP COLUMN "expected",
ADD COLUMN     "coverNote" TEXT,
ADD COLUMN     "proposedFee" INTEGER,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "status" SET DEFAULT 'PENDING_TUTOR_ACCEPT';

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "description",
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EmailToken" DROP COLUMN "type",
ADD COLUMN     "consumed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "purpose" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "token",
ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "link",
DROP COLUMN "message",
DROP COLUMN "readAt",
ADD COLUMN     "body" TEXT,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "addressLine",
DROP COLUMN "cityName",
DROP COLUMN "countryCode",
DROP COLUMN "description",
DROP COLUMN "isVisible",
DROP COLUMN "maxBudget",
DROP COLUMN "minBudget",
DROP COLUMN "modes",
DROP COLUMN "stateCode",
DROP COLUMN "studentId",
DROP COLUMN "subject",
DROP COLUMN "title",
DROP COLUMN "useProfileContact",
DROP COLUMN "zip",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "mode" "Mode",
ADD COLUMN     "reqAddressLine" TEXT,
ADD COLUMN     "reqCityName" TEXT,
ADD COLUMN     "reqCountryCode" TEXT,
ADD COLUMN     "reqStateCode" TEXT,
ADD COLUMN     "reqZip" TEXT,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_pkey",
DROP COLUMN "dob",
DROP COLUMN "educationLevel",
ADD COLUMN     "educationLevel" "EducationLevel";

-- AlterTable
ALTER TABLE "TutorProfile" DROP CONSTRAINT "TutorProfile_pkey",
DROP COLUMN "hourlyMax",
DROP COLUMN "hourlyMin",
DROP COLUMN "status",
DROP COLUMN "tagline",
ADD COLUMN     "rating" DOUBLE PRECISION,
ALTER COLUMN "subjects" DROP NOT NULL,
ALTER COLUMN "subjects" DROP DEFAULT,
ALTER COLUMN "subjects" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "TutorStatus";

-- CreateIndex
CREATE INDEX "Assignment_requestId_idx" ON "Assignment"("requestId");

-- CreateIndex
CREATE INDEX "EmailToken_userId_purpose_idx" ON "EmailToken"("userId", "purpose");

-- CreateIndex
CREATE INDEX "EmailToken_expiresAt_consumed_idx" ON "EmailToken"("expiresAt", "consumed");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_email_reason_createdAt_idx" ON "OtpChallenge"("email", "reason", "createdAt");

-- CreateIndex
CREATE INDEX "OtpChallenge_email_reason_used_expiresAt_idx" ON "OtpChallenge"("email", "reason", "used", "expiresAt");

-- CreateIndex
CREATE INDEX "Request_status_type_idx" ON "Request"("status", "type");

-- CreateIndex
CREATE INDEX "Request_createdById_status_idx" ON "Request"("createdById", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "TutorProfile"("userId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
