-- AlterTable
ALTER TABLE `organizations` ADD COLUMN `margin_dish` INTEGER NULL;

-- AlterTable
ALTER TABLE `precovenda` ADD COLUMN `precisaAtualizar` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `precoSugerido` DOUBLE NULL,
    ALTER COLUMN `data_fim` DROP DEFAULT;

-- AlterTable
ALTER TABLE `recipe` ADD COLUMN `impactaPreco` BOOLEAN NOT NULL DEFAULT false;
