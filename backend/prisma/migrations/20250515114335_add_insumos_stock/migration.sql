-- AlterTable
ALTER TABLE `products` ADD COLUMN `is_fractional` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `unit` ENUM('kg', 'l', 'un') NOT NULL DEFAULT 'un';
