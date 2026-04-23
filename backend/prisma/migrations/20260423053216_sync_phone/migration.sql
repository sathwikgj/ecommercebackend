/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TwoFactorMethod" ADD VALUE 'AUTH_APP';

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");
