/*
  Warnings:

  - You are about to drop the column `salePrice_unitario` on the `purchase_products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- AlterTable
ALTER TABLE `purchase_products` DROP COLUMN `salePrice_unitario`;
