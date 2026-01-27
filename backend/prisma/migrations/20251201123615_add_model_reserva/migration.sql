-- AlterTable
ALTER TABLE `mesas` ADD COLUMN `capacidade` INTEGER NOT NULL DEFAULT 4,
    ADD COLUMN `qrCodeUrl` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('livre', 'ocupada', 'reservada', 'manutencao') NOT NULL DEFAULT 'livre';

-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- CreateTable
CREATE TABLE `reservas` (
    `id` VARCHAR(191) NOT NULL,
    `mesaId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `clienteNome` VARCHAR(191) NOT NULL,
    `clienteTelefone` VARCHAR(191) NULL,
    `clienteEmail` VARCHAR(191) NULL,
    `dataReserva` DATETIME(3) NOT NULL,
    `quantidadePessoas` INTEGER NOT NULL,
    `status` ENUM('pendente', 'confirmada', 'cancelada', 'concluida', 'nao_compareceu') NOT NULL DEFAULT 'confirmada',
    `observacoes` VARCHAR(191) NULL,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadaEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_mesaId_fkey` FOREIGN KEY (`mesaId`) REFERENCES `mesas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservas` ADD CONSTRAINT `reservas_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
