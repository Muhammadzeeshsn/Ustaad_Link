-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "reason" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "iat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exp" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpChallenge_email_reason_idx" ON "OtpChallenge"("email", "reason");

-- CreateIndex
CREATE INDEX "OtpChallenge_email_role_reason_idx" ON "OtpChallenge"("email", "role", "reason");
