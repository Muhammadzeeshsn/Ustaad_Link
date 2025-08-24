-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "preferredTimeEnd" TIMESTAMP(3),
ADD COLUMN     "preferredTimeStart" TIMESTAMP(3),
ADD COLUMN     "reqAddressLine" TEXT,
ADD COLUMN     "reqCityName" TEXT,
ADD COLUMN     "reqCountryCode" TEXT,
ADD COLUMN     "reqStateCode" TEXT,
ADD COLUMN     "reqZip" TEXT,
ADD COLUMN     "subjects" TEXT[];

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "cityName" TEXT,
ADD COLUMN     "cnicPassport" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "institute" TEXT,
ADD COLUMN     "phoneAlt" TEXT,
ADD COLUMN     "stateCode" TEXT,
ADD COLUMN     "zip" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
