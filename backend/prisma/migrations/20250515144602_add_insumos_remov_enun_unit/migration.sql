/*
  Warnings:

  - You are about to alter the column `unit` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `isDerived` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `unit` VARCHAR(191) NOT NULL;
