/*
  Warnings:

  - You are about to drop the column `purchasePrice` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `purchases` table. All the data in the column will be lost.
  - Made the column `salePrice_unitario` on table `purchase_products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `purchase_products` MODIFY `salePrice_unitario` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `purchases` DROP COLUMN `purchasePrice`,
    DROP COLUMN `salePrice`;
