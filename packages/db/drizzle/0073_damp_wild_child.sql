PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text NOT NULL,
	`userId` text NOT NULL,
	`type` text,
	`providerId` text,
	`provider` text,
	`password` text,
	`providerAccountId` text,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`refreshTokenExpiresAt` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	`createdAt` integer,
	`updatedAt` integer,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "userId", "type", "providerId", "provider", "password", "providerAccountId", "refresh_token", "access_token", "expires_at", "refreshTokenExpiresAt", "token_type", "scope", "id_token", "session_state", "createdAt", "updatedAt") SELECT "id", "userId", "type", "providerId", "provider", "password", "providerAccountId", "refresh_token", "access_token", "expires_at", "refreshTokenExpiresAt", "token_type", "scope", "id_token", "session_state", "createdAt", "updatedAt" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`createdAt` integer,
	`updatedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "sessionToken", "userId", "expires", "ipAddress", "userAgent", "createdAt", "updatedAt") SELECT "id", "sessionToken", "userId", "expires", "ipAddress", "userAgent", "createdAt", "updatedAt" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`role` text DEFAULT 'user',
	`bookmarkQuota` integer,
	`storageQuota` integer,
	`browserCrawlingEnabled` integer,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "emailVerified", "image", "role", "bookmarkQuota", "storageQuota", "browserCrawlingEnabled", "createdAt", "updatedAt") SELECT "id", "name", "email", "emailVerified", "image", "role", "bookmarkQuota", "storageQuota", "browserCrawlingEnabled", "createdAt", "updatedAt" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `__new_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text,
	`value` text,
	`expiresAt` integer,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
INSERT INTO `__new_verification`("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt") SELECT "id", "identifier", "value", "expiresAt", "createdAt", "updatedAt" FROM `verification`;--> statement-breakpoint
DROP TABLE `verification`;--> statement-breakpoint
ALTER TABLE `__new_verification` RENAME TO `verification`;