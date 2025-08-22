/*
  Warnings:

  - You are about to drop the column `exp` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `iat` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `OtpChallenge` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `OtpChallenge` table. All the data in the column will be lost.
  - Added the required column `codeHash` to the `OtpChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `OtpChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "OtpChallenge_email_reason_idx";

-- DropIndex
DROP INDEX "OtpChallenge_email_role_reason_idx";

-- AlterTable
ALTER TABLE "OtpChallenge" DROP COLUMN "exp",
DROP COLUMN "hash",
DROP COLUMN "iat",
DROP COLUMN "role",
DROP COLUMN "salt",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "codeHash" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "payload" JSONB;

-- CreateTable
CREATE TABLE "LoginThrottle" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "LoginThrottle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginThrottle_lockedUntil_idx" ON "LoginThrottle"("lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "LoginThrottle_email_role_key" ON "LoginThrottle"("email", "role");

-- CreateIndex
CREATE INDEX "OtpChallenge_email_idx" ON "OtpChallenge"("email");

-- CreateIndex
CREATE INDEX "OtpChallenge_reason_idx" ON "OtpChallenge"("reason");
