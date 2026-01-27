-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- CreateTable
CREATE TABLE `faturas` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `valorTotal` DOUBLE NOT NULL,
    `status` ENUM('pendente', 'paga', 'cancelada') NOT NULL DEFAULT 'pendente',
    `metodoPagamento` VARCHAR(191) NULL,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pagaEm` DATETIME(3) NULL,

    UNIQUE INDEX `faturas_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `faturas` ADD CONSTRAINT `faturas_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
