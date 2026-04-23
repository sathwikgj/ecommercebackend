/*
  Warnings:

  - You are about to drop the `Filter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FilterValue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `twoFactorSecret` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoFactorSecret` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TwoFactorTarget" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TwoFactorMethod" AS ENUM ('PHONE_OTP', 'EMAIL_OTP');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "FilterValue" DROP CONSTRAINT "FilterValue_filterId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "parentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "discount" SET DEFAULT 0;

-- DropTable
DROP TABLE "Filter";

-- DropTable
DROP TABLE "FilterValue";

-- CreateTable
CREATE TABLE "TwoFactorSession" (
    "id" TEXT NOT NULL,
    "accountType" "TwoFactorTarget" NOT NULL,
    "method" "TwoFactorMethod" NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "phone" TEXT,
    "otpHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TwoFactorSession_userId_idx" ON "TwoFactorSession"("userId");

-- CreateIndex
CREATE INDEX "TwoFactorSession_adminId_idx" ON "TwoFactorSession"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPasswordResetToken_token_key" ON "AdminPasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "AdminPasswordResetToken_adminId_idx" ON "AdminPasswordResetToken"("adminId");

-- AddForeignKey
ALTER TABLE "TwoFactorSession" ADD CONSTRAINT "TwoFactorSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorSession" ADD CONSTRAINT "TwoFactorSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPasswordResetToken" ADD CONSTRAINT "AdminPasswordResetToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
