/*
  Warnings:

  - You are about to drop the column `abertaEm` on the `mesa_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `codigoAbertura` on the `mesa_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `fechadaEm` on the `mesa_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `mesaId` on the `mesa_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `mesa_sessions` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `mesa_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `mesa_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mesa_sessions` DROP FOREIGN KEY `mesa_sessions_mesaId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_sessionId_fkey`;

-- DropIndex
DROP INDEX `mesa_sessions_codigoAbertura_key` ON `mesa_sessions`;

-- AlterTable
ALTER TABLE `mesa_sessions` DROP COLUMN `abertaEm`,
    DROP COLUMN `codigoAbertura`,
    DROP COLUMN `fechadaEm`,
    DROP COLUMN `mesaId`,
    DROP COLUMN `status`,
    ADD COLUMN `orderId` VARCHAR(191) NOT NULL,
    ADD COLUMN `sessionId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `codigoAbertura` VARCHAR(191) NOT NULL,
    `mesaId` VARCHAR(191) NOT NULL,
    `abertaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechadaEm` DATETIME(3) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sessions_codigoAbertura_key`(`codigoAbertura`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mesa_sessions` ADD CONSTRAINT `mesa_sessions_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesa_sessions` ADD CONSTRAINT `mesa_sessions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_mesaId_fkey` FOREIGN KEY (`mesaId`) REFERENCES `mesas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
