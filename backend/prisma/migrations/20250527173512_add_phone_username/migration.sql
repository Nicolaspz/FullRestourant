/*
  Warnings:

  - A unique constraint covering the columns `[telefone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telefone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `telefone` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_telefone_key` ON `users`(`telefone`);
