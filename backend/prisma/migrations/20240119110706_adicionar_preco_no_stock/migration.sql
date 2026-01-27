/*
  Warnings:

  - Added the required column `price` to the `stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `stock` ADD COLUMN `price` DOUBLE NOT NULL;
