/*
  Warnings:

  - You are about to drop the column `buffer_time` on the `doctor_availability` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "decline_reason" TEXT;

-- AlterTable
ALTER TABLE "doctor_availability" DROP COLUMN "buffer_time";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_file_id" TEXT;
