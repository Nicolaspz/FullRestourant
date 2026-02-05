/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `precovenda` ALTER COLUMN `data_fim` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `categories_name_organizationId_key` ON `categories`(`name`, `organizationId`);

-- CreateIndex
CREATE UNIQUE INDEX `products_name_organizationId_key` ON `products`(`name`, `organizationId`);
