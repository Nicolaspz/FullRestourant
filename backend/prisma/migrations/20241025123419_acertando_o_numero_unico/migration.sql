/*
  Warnings:

  - A unique constraint covering the columns `[numero,organizationId]` on the table `mesas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `mesas_numero_key` ON `mesas`;

-- CreateIndex
CREATE UNIQUE INDEX `mesas_numero_organizationId_key` ON `mesas`(`numero`, `organizationId`);
