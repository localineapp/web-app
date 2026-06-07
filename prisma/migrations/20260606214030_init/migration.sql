-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `role` TEXT NULL,
    `banned` BOOLEAN NULL DEFAULT false,
    `banReason` TEXT NULL,
    `banExpires` DATETIME(3) NULL,
    `lastLoginMethod` TEXT NULL,
    `projectsLimit` INTEGER NOT NULL DEFAULT 5,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` TEXT NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `impersonatedBy` TEXT NULL,

    INDEX `session_userId_idx`(`userId`(191)),
    UNIQUE INDEX `session_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `account_userId_idx`(`userId`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `verification_identifier_idx`(`identifier`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apikey` (
    `id` VARCHAR(191) NOT NULL,
    `configId` TEXT NOT NULL,
    `name` TEXT NULL,
    `start` TEXT NULL,
    `referenceId` TEXT NOT NULL,
    `prefix` TEXT NULL,
    `key` TEXT NOT NULL,
    `refillInterval` INTEGER NULL,
    `refillAmount` INTEGER NULL,
    `lastRefillAt` DATETIME(3) NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `rateLimitEnabled` BOOLEAN NULL DEFAULT true,
    `rateLimitTimeWindow` INTEGER NULL DEFAULT 86400000,
    `rateLimitMax` INTEGER NULL DEFAULT 10,
    `requestCount` INTEGER NULL DEFAULT 0,
    `remaining` INTEGER NULL,
    `lastRequest` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `permissions` TEXT NULL,
    `metadata` TEXT NULL,

    INDEX `apikey_configId_idx`(`configId`(191)),
    INDEX `apikey_referenceId_idx`(`referenceId`(191)),
    INDEX `apikey_key_idx`(`key`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locale` (
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `language` TEXT NOT NULL,
    `region` TEXT NULL,
    `code` VARCHAR(191) NOT NULL,
    `flag` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locale_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan` (
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `localesLimit` INTEGER NULL,
    `termsLimit` INTEGER NULL,
    `labelsLimit` INTEGER NULL,
    `membersLimit` INTEGER NULL,
    `default` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_displayName_key`(`displayName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `description` TEXT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_locale` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `localeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_locale_projectId_idx`(`projectId`(191)),
    INDEX `project_locale_localeId_idx`(`localeId`(191)),
    UNIQUE INDEX `project_locale_projectId_localeId_key`(`projectId`, `localeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_term` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `context` TEXT NULL,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_term_projectId_idx`(`projectId`(191)),
    UNIQUE INDEX `project_term_projectId_key_key`(`projectId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_translation` (
    `id` VARCHAR(191) NOT NULL,
    `termId` VARCHAR(191) NOT NULL,
    `localeId` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_translation_termId_idx`(`termId`(191)),
    INDEX `project_translation_localeId_idx`(`localeId`(191)),
    UNIQUE INDEX `project_translation_termId_localeId_key`(`termId`, `localeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_label` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_label_projectId_idx`(`projectId`(191)),
    UNIQUE INDEX `project_label_projectId_name_key`(`projectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_member` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_member_projectId_idx`(`projectId`(191)),
    INDEX `project_member_userId_idx`(`userId`(191)),
    INDEX `project_member_roleId_idx`(`roleId`(191)),
    UNIQUE INDEX `project_member_projectId_userId_key`(`projectId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_member_role` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `permissions` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_member_role_projectId_idx`(`projectId`(191)),
    UNIQUE INDEX `project_member_role_projectId_name_key`(`projectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_invitation` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL DEFAULT DATE_ADD(NOW(), INTERVAL 7 DAY),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_invitation_token_key`(`token`),
    INDEX `project_invitation_projectId_idx`(`projectId`(191)),
    INDEX `project_invitation_roleId_idx`(`roleId`(191)),
    INDEX `project_invitation_email_idx`(`email`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectLocaleToProjectMember` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProjectLocaleToProjectMember_AB_unique`(`A`, `B`),
    INDEX `_ProjectLocaleToProjectMember_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectLabelToProjectTerm` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProjectLabelToProjectTerm_AB_unique`(`A`, `B`),
    INDEX `_ProjectLabelToProjectTerm_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_locale` ADD CONSTRAINT `project_locale_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_locale` ADD CONSTRAINT `project_locale_localeId_fkey` FOREIGN KEY (`localeId`) REFERENCES `locale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_term` ADD CONSTRAINT `project_term_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_translation` ADD CONSTRAINT `project_translation_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `project_term`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_translation` ADD CONSTRAINT `project_translation_localeId_fkey` FOREIGN KEY (`localeId`) REFERENCES `project_locale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_label` ADD CONSTRAINT `project_label_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member` ADD CONSTRAINT `project_member_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `project_member_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_member_role` ADD CONSTRAINT `project_member_role_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_invitation` ADD CONSTRAINT `project_invitation_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_invitation` ADD CONSTRAINT `project_invitation_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `project_member_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_invitation` ADD CONSTRAINT `project_invitation_email_fkey` FOREIGN KEY (`email`) REFERENCES `user`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectLocaleToProjectMember` ADD CONSTRAINT `_ProjectLocaleToProjectMember_A_fkey` FOREIGN KEY (`A`) REFERENCES `project_locale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectLocaleToProjectMember` ADD CONSTRAINT `_ProjectLocaleToProjectMember_B_fkey` FOREIGN KEY (`B`) REFERENCES `project_member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectLabelToProjectTerm` ADD CONSTRAINT `_ProjectLabelToProjectTerm_A_fkey` FOREIGN KEY (`A`) REFERENCES `project_label`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectLabelToProjectTerm` ADD CONSTRAINT `_ProjectLabelToProjectTerm_B_fkey` FOREIGN KEY (`B`) REFERENCES `project_term`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
