CREATE DATABASE IF NOT EXISTS `im_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `im_app`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像URL',
  `phone` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '手机号',
  `password` VARCHAR(256) NOT NULL DEFAULT '' COMMENT '密码(bcrypt)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `groups` (
  `id` VARCHAR(64) NOT NULL COMMENT '群组ID',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '群名',
  `avatar` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '群头像URL',
  `owner_id` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '群主ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` VARCHAR(64) NOT NULL COMMENT '群组ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `role` VARCHAR(16) NOT NULL DEFAULT 'member' COMMENT '角色: owner/admin/member',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_group_user` (`group_id`, `user_id`),
  KEY `idx_group_id` (`group_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` VARCHAR(64) NOT NULL COMMENT '会话ID',
  `type` VARCHAR(16) NOT NULL DEFAULT 'private' COMMENT '会话类型: private/group',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '会话名称',
  `avatar` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '会话头像',
  `group_id` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '群组ID(群聊时关联)',
  `last_message` TEXT COMMENT '最后一条消息内容',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conversation_members` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(64) NOT NULL COMMENT '会话ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `unread_count` INT NOT NULL DEFAULT 0 COMMENT '未读消息数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conversation_user` (`conversation_id`, `user_id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(64) NOT NULL COMMENT '消息ID',
  `conversation_id` VARCHAR(64) NOT NULL COMMENT '会话ID',
  `sender_id` VARCHAR(64) NOT NULL COMMENT '发送者ID',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `type` VARCHAR(16) NOT NULL DEFAULT 'text' COMMENT '消息类型',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `contact_id` VARCHAR(64) NOT NULL COMMENT '联系人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_contact` (`user_id`, `contact_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
