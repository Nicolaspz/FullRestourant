-- DropForeignKey
ALTER TABLE `pedidos_area` DROP FOREIGN KEY `pedidos_area_areaOrigemId_fkey`;

-- AlterTable
ALTER TABLE `items` ADD COLUMN `areaOriginId` VARCHAR(191) NULL,
    ADD COLUMN `canceled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canceledAt` DATETIME(3) NULL,
    ADD COLUMN `canceledReason` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pendente', 'em_preparacao', 'pronto', 'cancelado', 'rejeitado') NOT NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE `pedidos_area` ADD COLUMN `confirmationCode` VARCHAR(191) NULL,
    MODIFY `areaOrigemId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `defaultAreaId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock_history` ADD COLUMN `areaId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `product_area_mapping` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `product_area_mapping_productId_areaId_organizationId_key`(`productId`, `areaId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_history` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `statusAnterior` VARCHAR(191) NULL,
    `novoStatus` VARCHAR(191) NOT NULL,
    `alteradoPor` VARCHAR(191) NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacoes` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_defaultAreaId_fkey` FOREIGN KEY (`defaultAreaId`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_area_mapping` ADD CONSTRAINT `product_area_mapping_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_area_mapping` ADD CONSTRAINT `product_area_mapping_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_area_mapping` ADD CONSTRAINT `product_area_mapping_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos_area` ADD CONSTRAINT `pedidos_area_areaOrigemId_fkey` FOREIGN KEY (`areaOrigemId`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_history` ADD CONSTRAINT `pedido_history_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos_area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_areaOriginId_fkey` FOREIGN KEY (`areaOriginId`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_history` ADD CONSTRAINT `stock_history_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
