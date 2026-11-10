-- AlterTable
ALTER TABLE `Order` ADD COLUMN `orderNumber` VARCHAR(191) NULL;

-- Backfill existing orders in creation order as AW-1001, AW-1002, ...
SET @row := 1000;
UPDATE `Order`
SET `orderNumber` = CONCAT('AW-', (@row := @row + 1))
ORDER BY `createdAt` ASC, `id` ASC;

-- AlterTable
ALTER TABLE `Order` MODIFY `orderNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderNumber_key` ON `Order`(`orderNumber`);
