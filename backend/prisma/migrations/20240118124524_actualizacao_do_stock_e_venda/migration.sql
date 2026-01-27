/*
  Warnings:

  - You are about to drop the column `productType` on the `purchase_products` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `purchase_products` table. All the data in the column will be lost.
  - You are about to drop the column `isBox` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `isCan` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `isPackaging` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `unitsPerPack` on the `purchases` table. All the data in the column will be lost.
  - Added the required column `qtdCompra` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `purchase_products` DROP COLUMN `productType`,
    DROP COLUMN `salePrice`,
    ADD COLUMN `productTypeId` VARCHAR(191) NULL,
    ADD COLUMN `salePrice_unitario` DOUBLE NULL,
    MODIFY `purchasePrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `purchases` DROP COLUMN `isBox`,
    DROP COLUMN `isCan`,
    DROP COLUMN `isPackaging`,
    DROP COLUMN `productType`,
    DROP COLUMN `supplier`,
    DROP COLUMN `unitsPerPack`,
    ADD COLUMN `SupplierId` VARCHAR(191) NULL,
    ADD COLUMN `qtdCompra` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductType` (
    `id` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_SupplierId_fkey` FOREIGN KEY (`SupplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_products` ADD CONSTRAINT `purchase_products_productTypeId_fkey` FOREIGN KEY (`productTypeId`) REFERENCES `ProductType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
