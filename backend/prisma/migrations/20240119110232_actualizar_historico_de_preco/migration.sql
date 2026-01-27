/*
  Warnings:

  - You are about to drop the column `salePrice` on the `sale_price_history` table. All the data in the column will be lost.
  - Added the required column `newPrice` to the `sale_price_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldPrice` to the `sale_price_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sale_price_history` DROP COLUMN `salePrice`,
    ADD COLUMN `newPrice` DOUBLE NOT NULL,
    ADD COLUMN `oldPrice` DOUBLE NOT NULL;
