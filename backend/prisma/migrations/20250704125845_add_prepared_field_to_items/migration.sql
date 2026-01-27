-- AlterTable
ALTER TABLE `items` ADD COLUMN `prepared` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;
