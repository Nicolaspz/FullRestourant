/*
  Warnings:

  - You are about to alter the column `metodoPagamento` on the `faturas` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `faturas` ADD COLUMN `observacoes` VARCHAR(191) NULL,
    ADD COLUMN `trocoPara` DOUBLE NULL,
    ADD COLUMN `valorPago` DOUBLE NULL,
    MODIFY `metodoPagamento` ENUM('dinheiro', 'multicaixa', 'cartao', 'transferencia') NULL;

-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` VARCHAR(191) NOT NULL,
    `faturaId` VARCHAR(191) NOT NULL,
    `metodo` ENUM('dinheiro', 'multicaixa', 'cartao', 'transferencia') NOT NULL,
    `valor` DOUBLE NOT NULL,
    `dataPagamento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `referencia` VARCHAR(191) NULL,
    `observacoes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_faturaId_fkey` FOREIGN KEY (`faturaId`) REFERENCES `faturas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
