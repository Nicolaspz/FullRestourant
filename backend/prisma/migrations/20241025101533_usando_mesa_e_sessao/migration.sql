/*
  Warnings:

  - You are about to drop the column `table` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `table`,
    ADD COLUMN `sessionId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `mesas` (
    `id` VARCHAR(191) NOT NULL,
    `numero` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mesas_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mesa_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `codigoAbertura` VARCHAR(191) NOT NULL,
    `mesaId` VARCHAR(191) NOT NULL,
    `abertaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechadaEm` DATETIME(3) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mesa_sessions_codigoAbertura_key`(`codigoAbertura`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mesas` ADD CONSTRAINT `mesas_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesa_sessions` ADD CONSTRAINT `mesa_sessions_mesaId_fkey` FOREIGN KEY (`mesaId`) REFERENCES `mesas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesa_sessions` ADD CONSTRAINT `mesa_sessions_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `mesa_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
