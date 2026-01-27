/*
  Warnings:

  - You are about to drop the column `purchaseProductId` on the `sale_price_history` table. All the data in the column will be lost.
  - Added the required column `purchaseId` to the `sale_price_history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sale_price_history` DROP FOREIGN KEY `sale_price_history_purchaseProductId_fkey`;

-- AlterTable
ALTER TABLE `sale_price_history` DROP COLUMN `purchaseProductId`,
    ADD COLUMN `purchaseId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `sale_price_history` ADD CONSTRAINT `sale_price_history_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
