/*
  Warnings:

  - You are about to drop the column `create_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `adress` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `stockhistory` table. All the data in the column will be lost.
  - You are about to drop the column `create_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `update_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[address]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `organizations_adress_key` ON `organizations`;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `items` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `organizations` DROP COLUMN `adress`,
    DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `products` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stockhistory` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `users` DROP COLUMN `create_at`,
    DROP COLUMN `update_at`,
    ADD COLUMN `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `purchases` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supplier` VARCHAR(191) NOT NULL,
    `purchasePrice` DOUBLE NOT NULL,
    `salePrice` DOUBLE NOT NULL,
    `productType` ENUM('Embalagem', 'Lata', 'Caixa') NOT NULL DEFAULT 'Embalagem',
    `isPackaging` BOOLEAN NOT NULL,
    `isBox` BOOLEAN NOT NULL,
    `isCan` BOOLEAN NOT NULL,
    `unitsPerPack` INTEGER NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_products` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `purchasePrice` DOUBLE NOT NULL,
    `salePrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productType` ENUM('Embalagem', 'Lata', 'Caixa') NOT NULL DEFAULT 'Embalagem',
    `purchaseId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_price_history` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `salePrice` DOUBLE NOT NULL,
    `purchaseProductId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `organizations_address_key` ON `organizations`(`address`);

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_products` ADD CONSTRAINT `purchase_products_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_products` ADD CONSTRAINT `purchase_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_price_history` ADD CONSTRAINT `sale_price_history_purchaseProductId_fkey` FOREIGN KEY (`purchaseProductId`) REFERENCES `purchase_products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
