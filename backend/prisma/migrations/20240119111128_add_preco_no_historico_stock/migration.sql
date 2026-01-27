/*
  Warnings:

  - Added the required column `price` to the `StockHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stockhistory` ADD COLUMN `price` DOUBLE NOT NULL;
