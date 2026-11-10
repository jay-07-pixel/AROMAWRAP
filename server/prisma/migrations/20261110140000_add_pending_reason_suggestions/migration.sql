-- CreateTable
CREATE TABLE `PendingReasonSuggestion` (
    `id` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `reasonKey` VARCHAR(64) NOT NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 1,
    `lastUsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PendingReasonSuggestion_reasonKey_key`(`reasonKey`),
    INDEX `PendingReasonSuggestion_usageCount_idx`(`usageCount`),
    INDEX `PendingReasonSuggestion_lastUsedAt_idx`(`lastUsedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed from any existing order pending reasons
INSERT INTO `PendingReasonSuggestion` (`id`, `reason`, `reasonKey`, `usageCount`, `lastUsedAt`, `createdAt`, `updatedAt`)
SELECT
  UUID(),
  TRIM(`statusReason`),
  SHA2(LOWER(TRIM(`statusReason`)), 256),
  COUNT(*),
  MAX(`updatedAt`),
  NOW(3),
  NOW(3)
FROM `Order`
WHERE `statusReason` IS NOT NULL
  AND TRIM(`statusReason`) <> ''
GROUP BY TRIM(`statusReason`);
