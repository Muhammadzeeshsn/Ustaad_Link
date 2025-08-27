/*
  Warnings:

  - The values [SUBMITTED,SHORTLISTED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,CANCELLED] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT,IN_PROGRESS] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [SCHOOL,COLLEGE,UNIVERSITY,QURAN,OTHER] on the enum `RequestType` will be removed. If these variants are still used in the database, this will fail.
  - The values [DISABLED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expiresAt` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `EmailToken` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `cityName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `stateCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Request` table. All the data in the column will be lost.
  - The primary key for the `StudentProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `location` on the `StudentProfile` table. All the data in the column will be lost.
  - The primary key for the `TutorProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expertise` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `StudentProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `TutorProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `EmailToken` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastAttemptAt` on table `LoginThrottle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `studentId` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ApplicationStatus_new" AS ENUM ('PENDING_REVIEW', 'REJECTED', 'FORWARDED_TO_STUDENT', 'ACCEPTED_BY_STUDENT', 'DECLINED_BY_STUDENT');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Application" ALTER COLUMN "status" TYPE "public"."ApplicationStatus_new" USING ("status"::text::"public"."ApplicationStatus_new");
ALTER TYPE "public"."ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "public"."ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "public"."Application" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."AssignmentStatus_new" AS ENUM ('PENDING_TUTOR_ACCEPT', 'ACCEPTED', 'REJECTED', 'COMPLETED');
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" TYPE "public"."AssignmentStatus_new" USING ("status"::text::"public"."AssignmentStatus_new");
ALTER TYPE "public"."AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "public"."AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "public"."AssignmentStatus_old";
ALTER TABLE "public"."Assignment" ALTER COLUMN "status" SET DEFAULT 'PENDING_TUTOR_ACCEPT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RequestStatus_new" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'ASSIGNED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Request" ALTER COLUMN "status" TYPE "public"."RequestStatus_new" USING ("status"::text::"public"."RequestStatus_new");
ALTER TYPE "public"."RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "public"."RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "public"."Request" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RequestType_new" AS ENUM ('HIRE_TUTOR', 'HIRE_QURAN', 'PROJECT_HELP');
ALTER TABLE "public"."Request" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Request" ALTER COLUMN "type" TYPE "public"."RequestType_new" USING ("type"::text::"public"."RequestType_new");
ALTER TYPE "public"."RequestType" RENAME TO "RequestType_old";
ALTER TYPE "public"."RequestType_new" RENAME TO "RequestType";
DROP TYPE "public"."RequestType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserStatus_new" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "status" TYPE "public"."UserStatus_new" USING ("status"::text::"public"."UserStatus_new");
ALTER TYPE "public"."UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "public"."UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "public"."User" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "public"."EmailToken" DROP COLUMN "expiresAt",
DROP COLUMN "purpose",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."EmailVerificationToken" DROP COLUMN "expiresAt";

-- AlterTable
ALTER TABLE "public"."LoginThrottle" ALTER COLUMN "lastAttemptAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "public"."OtpChallenge" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "addressLine",
DROP COLUMN "cityName",
DROP COLUMN "countryCode",
DROP COLUMN "details",
DROP COLUMN "stateCode",
DROP COLUMN "zip",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reqAddressLine" TEXT,
ADD COLUMN     "reqCityName" TEXT,
ADD COLUMN     "reqCountryCode" TEXT,
ADD COLUMN     "reqStateCode" TEXT,
ADD COLUMN     "reqZip" TEXT,
ALTER COLUMN "studentId" SET NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."StudentProfile" DROP CONSTRAINT "StudentProfile_pkey",
DROP COLUMN "location";

-- AlterTable
ALTER TABLE "public"."TutorProfile" DROP CONSTRAINT "TutorProfile_pkey",
DROP COLUMN "expertise",
DROP COLUMN "image",
DROP COLUMN "location",
DROP COLUMN "phone",
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "hourlyRate" INTEGER,
ADD COLUMN     "subjects" TEXT;

-- DropTable
DROP TABLE "public"."Course";

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "public"."StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TutorProfile_userId_key" ON "public"."TutorProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
