/*
  Warnings:

  - You are about to drop the column `created_at` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `stock` table. All the data in the column will be lost.
  - Added the required column `totalQuantity` to the `stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stock` DROP COLUMN `created_at`,
    DROP COLUMN `quantity`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `totalQuantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `stock_history` ADD COLUMN `loteId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `lotes` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `preco_compra` DOUBLE NOT NULL,
    `preco_venda` DOUBLE NULL,
    `data_compra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_validade` DATETIME(3) NULL,
    `purchaseId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `lotes_productId_organizationId_idx`(`productId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes` ADD CONSTRAINT `lotes_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_history` ADD CONSTRAINT `stock_history_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `lotes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
