/*
  Warnings:

  - Added the required column `productId` to the `sale_price_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sale_price_history` ADD COLUMN `productId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `sale_price_history` ADD CONSTRAINT `sale_price_history_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
