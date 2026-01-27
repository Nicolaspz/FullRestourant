/*
  Warnings:

  - You are about to drop the column `numero` on the `mesas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[number,organizationId]` on the table `mesas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `mesas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `mesas_numero_organizationId_key` ON `mesas`;

-- AlterTable
ALTER TABLE `mesas` DROP COLUMN `numero`,
    ADD COLUMN `number` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `mesas_number_organizationId_key` ON `mesas`(`number`, `organizationId`);
