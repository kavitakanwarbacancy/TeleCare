-- AlterTable
ALTER TABLE "patients" ADD COLUMN "phone" TEXT,
ADD COLUMN "blood_group" TEXT,
ADD COLUMN "height" INTEGER,
ADD COLUMN "weight" DECIMAL(5,2),
ADD COLUMN "emergency_contact_name" TEXT,
ADD COLUMN "emergency_contact_phone" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "address" TEXT;
