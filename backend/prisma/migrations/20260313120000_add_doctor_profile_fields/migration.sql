-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN "registration_number" TEXT,
ADD COLUMN "degree" TEXT,
ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "doctor_profiles_verified_idx" ON "doctor_profiles"("verified");
