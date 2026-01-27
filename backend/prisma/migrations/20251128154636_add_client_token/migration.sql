-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- AlterTable
ALTER TABLE `sessions` ADD COLUMN `clientToken` VARCHAR(191) NULL;
