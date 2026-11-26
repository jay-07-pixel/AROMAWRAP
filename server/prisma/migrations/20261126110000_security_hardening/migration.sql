-- AlterTable
ALTER TABLE `PasswordResetOtp` ADD COLUMN `failedAttempts` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `upiTransactionRef` VARCHAR(64) NULL;

-- CreateTable
CREATE TABLE `Session` (
    `sid` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `data` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
