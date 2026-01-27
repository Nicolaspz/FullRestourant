/*
  Warnings:

  - A unique constraint covering the columns `[adress]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `organizations` ADD COLUMN `activeLicense` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `organizations_adress_key` ON `organizations`(`adress`);
