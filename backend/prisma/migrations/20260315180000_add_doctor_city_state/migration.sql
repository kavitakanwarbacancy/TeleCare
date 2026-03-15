-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT;

-- CreateIndex
CREATE INDEX "doctor_profiles_city_idx" ON "doctor_profiles"("city");

-- CreateIndex
CREATE INDEX "doctor_profiles_state_idx" ON "doctor_profiles"("state");
