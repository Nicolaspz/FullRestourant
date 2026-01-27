/*
  Warnings:

  - You are about to drop the `mesa_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `mesa_sessions` DROP FOREIGN KEY `mesa_sessions_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `mesa_sessions` DROP FOREIGN KEY `mesa_sessions_organizationId_fkey`;

-- DropForeignKey
ALTER TABLE `mesa_sessions` DROP FOREIGN KEY `mesa_sessions_sessionId_fkey`;

-- DropTable
DROP TABLE `mesa_sessions`;

-- CreateTable
CREATE TABLE `order_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_sessions` ADD CONSTRAINT `order_sessions_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_sessions` ADD CONSTRAINT `order_sessions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_sessions` ADD CONSTRAINT `order_sessions_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
