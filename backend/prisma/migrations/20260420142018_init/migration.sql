/*
  Warnings:

  - You are about to drop the column `courier` on the `Shipment` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "courier",
ADD COLUMN     "provider" TEXT NOT NULL;
