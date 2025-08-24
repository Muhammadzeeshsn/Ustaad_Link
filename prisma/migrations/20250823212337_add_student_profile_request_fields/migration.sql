/*
  Warnings:

  - The values [SUBMITTED,SHORTLISTED,FORWARDED_TO_STUDENT,ACCEPTED_BY_STUDENT,DECLINED_BY_STUDENT] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_TUTOR_ACCEPT,ACCEPTED,REJECTED] on the enum `AssignmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPROVED,REJECTED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [HIRE_TUTOR,HIRE_QURAN] on the enum `RequestType` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPROVED,REJECTED] on the enum `TutorStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DISABLED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `coverLetter` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `cover_url` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `duration_weeks` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `attempts` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `payload` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMax` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `budgetMin` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `classLevel` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTime` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimeEnd` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimeStart` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `reqAddressLine` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `reqCityName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `reqCountryCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `reqStateCode` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `reqZip` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `experienceYears` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TutorProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Assignment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Assignment" ALTER COLUMN "status" TYPE "AssignmentStatus_new" USING ("status"::text::"AssignmentStatus_new");
ALTER TYPE "AssignmentStatus" RENAME TO "AssignmentStatus_old";
ALTER TYPE "AssignmentStatus_new" RENAME TO "AssignmentStatus";
DROP TYPE "AssignmentStatus_old";
ALTER TABLE "Assignment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('PENDING_REVIEW', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestType_new" AS ENUM ('SCHOOL', 'COLLEGE', 'UNIVERSITY', 'QURAN', 'PROJECT_HELP', 'OTHER');
ALTER TABLE "Request" ALTER COLUMN "type" TYPE "RequestType_new" USING ("type"::text::"RequestType_new");
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";
DROP TYPE "RequestType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TutorStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'HIDDEN');
ALTER TABLE "TutorProfile" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TutorProfile" ALTER COLUMN "status" TYPE "TutorStatus_new" USING ("status"::text::"TutorStatus_new");
ALTER TYPE "TutorStatus" RENAME TO "TutorStatus_old";
ALTER TYPE "TutorStatus_new" RENAME TO "TutorStatus";
DROP TYPE "TutorStatus_old";
ALTER TABLE "TutorProfile" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "coverLetter",
DROP COLUMN "price",
DROP COLUMN "updatedAt",
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "expected" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "cover_url",
DROP COLUMN "created_at",
DROP COLUMN "duration_weeks",
DROP COLUMN "is_published",
DROP COLUMN "level",
DROP COLUMN "mode",
DROP COLUMN "price",
DROP COLUMN "seats",
DROP COLUMN "tags",
DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LoginThrottle" ALTER COLUMN "lastAttemptAt" DROP NOT NULL,
ALTER COLUMN "lastAttemptAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "body",
DROP COLUMN "isRead",
ADD COLUMN     "link" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OtpChallenge" DROP COLUMN "attempts",
DROP COLUMN "payload";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "budgetMax",
DROP COLUMN "budgetMin",
DROP COLUMN "classLevel",
DROP COLUMN "currency",
DROP COLUMN "duration",
DROP COLUMN "location",
DROP COLUMN "mode",
DROP COLUMN "preferredLanguage",
DROP COLUMN "preferredTime",
DROP COLUMN "preferredTimeEnd",
DROP COLUMN "preferredTimeStart",
DROP COLUMN "reqAddressLine",
DROP COLUMN "reqCityName",
DROP COLUMN "reqCountryCode",
DROP COLUMN "reqStateCode",
DROP COLUMN "reqZip",
DROP COLUMN "subjects",
ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "cityName" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxBudget" INTEGER,
ADD COLUMN     "minBudget" INTEGER,
ADD COLUMN     "modes" "Mode"[],
ADD COLUMN     "stateCode" TEXT,
ADD COLUMN     "useProfileContact" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "zip" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "experienceYears",
DROP COLUMN "name",
ADD COLUMN     "hourlyMax" INTEGER,
ADD COLUMN     "hourlyMin" INTEGER,
ADD COLUMN     "tagline" TEXT,
ALTER COLUMN "subjects" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
