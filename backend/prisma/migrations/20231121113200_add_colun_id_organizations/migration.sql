/*
  Warnings:

  - Added the required column `organizationId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `items` ADD COLUMN `organizationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stockhistory` ADD COLUMN `organizationId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockHistory` ADD CONSTRAINT `StockHistory_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
