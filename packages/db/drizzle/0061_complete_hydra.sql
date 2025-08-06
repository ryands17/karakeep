PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_apiKey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer,
	`keyId` text NOT NULL,
	`keyHash` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_apiKey`("id", "name", "createdAt", "keyId", "keyHash", "userId") SELECT "id", "name", "createdAt", "keyId", "keyHash", "userId" FROM `apiKey`;--> statement-breakpoint
DROP TABLE `apiKey`;--> statement-breakpoint
ALTER TABLE `__new_apiKey` RENAME TO `apiKey`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `apiKey_keyId_unique` ON `apiKey` (`keyId`);--> statement-breakpoint
CREATE UNIQUE INDEX `apiKey_name_userId_unique` ON `apiKey` (`name`,`userId`);--> statement-breakpoint
CREATE TABLE `__new_bookmarkLists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text NOT NULL,
	`createdAt` integer,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`query` text,
	`parentId` text,
	`rssToken` text,
	`public` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parentId`) REFERENCES `bookmarkLists`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_bookmarkLists`("id", "name", "description", "icon", "createdAt", "userId", "type", "query", "parentId", "rssToken", "public") SELECT "id", "name", "description", "icon", "createdAt", "userId", "type", "query", "parentId", "rssToken", "public" FROM `bookmarkLists`;--> statement-breakpoint
DROP TABLE `bookmarkLists`;--> statement-breakpoint
ALTER TABLE `__new_bookmarkLists` RENAME TO `bookmarkLists`;--> statement-breakpoint
CREATE INDEX `bookmarkLists_userId_idx` ON `bookmarkLists` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarkLists_userId_id_idx` ON `bookmarkLists` (`userId`,`id`);--> statement-breakpoint
CREATE TABLE `__new_bookmarkTags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_bookmarkTags`("id", "name", "createdAt", "userId") SELECT "id", "name", "createdAt", "userId" FROM `bookmarkTags`;--> statement-breakpoint
DROP TABLE `bookmarkTags`;--> statement-breakpoint
ALTER TABLE `__new_bookmarkTags` RENAME TO `bookmarkTags`;--> statement-breakpoint
CREATE INDEX `bookmarkTags_name_idx` ON `bookmarkTags` (`name`);--> statement-breakpoint
CREATE INDEX `bookmarkTags_userId_idx` ON `bookmarkTags` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarkTags_userId_name_unique` ON `bookmarkTags` (`userId`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarkTags_userId_id_idx` ON `bookmarkTags` (`userId`,`id`);--> statement-breakpoint
CREATE TABLE `__new_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer,
	`modifiedAt` integer,
	`title` text,
	`archived` integer DEFAULT false NOT NULL,
	`favourited` integer DEFAULT false NOT NULL,
	`userId` text NOT NULL,
	`taggingStatus` text DEFAULT 'pending',
	`summarizationStatus` text DEFAULT 'pending',
	`summary` text,
	`note` text,
	`type` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_bookmarks`("id", "createdAt", "modifiedAt", "title", "archived", "favourited", "userId", "taggingStatus", "summarizationStatus", "summary", "note", "type") SELECT "id", "createdAt", "modifiedAt", "title", "archived", "favourited", "userId", "taggingStatus", "summarizationStatus", "summary", "note", "type" FROM `bookmarks`;--> statement-breakpoint
DROP TABLE `bookmarks`;--> statement-breakpoint
ALTER TABLE `__new_bookmarks` RENAME TO `bookmarks`;--> statement-breakpoint
CREATE INDEX `bookmarks_userId_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmarks_archived_idx` ON `bookmarks` (`archived`);--> statement-breakpoint
CREATE INDEX `bookmarks_favourited_idx` ON `bookmarks` (`favourited`);--> statement-breakpoint
CREATE INDEX `bookmarks_createdAt_idx` ON `bookmarks` (`createdAt`);--> statement-breakpoint
CREATE TABLE `__new_customPrompts` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`enabled` integer NOT NULL,
	`appliesTo` text NOT NULL,
	`createdAt` integer,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_customPrompts`("id", "text", "enabled", "appliesTo", "createdAt", "userId") SELECT "id", "text", "enabled", "appliesTo", "createdAt", "userId" FROM `customPrompts`;--> statement-breakpoint
DROP TABLE `customPrompts`;--> statement-breakpoint
ALTER TABLE `__new_customPrompts` RENAME TO `customPrompts`;--> statement-breakpoint
CREATE INDEX `customPrompts_userId_idx` ON `customPrompts` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`bookmarkId` text NOT NULL,
	`userId` text NOT NULL,
	`startOffset` integer NOT NULL,
	`endOffset` integer NOT NULL,
	`color` text DEFAULT 'yellow' NOT NULL,
	`text` text,
	`note` text,
	`createdAt` integer,
	FOREIGN KEY (`bookmarkId`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_highlights`("id", "bookmarkId", "userId", "startOffset", "endOffset", "color", "text", "note", "createdAt") SELECT "id", "bookmarkId", "userId", "startOffset", "endOffset", "color", "text", "note", "createdAt" FROM `highlights`;--> statement-breakpoint
DROP TABLE `highlights`;--> statement-breakpoint
ALTER TABLE `__new_highlights` RENAME TO `highlights`;--> statement-breakpoint
CREATE INDEX `highlights_bookmarkId_idx` ON `highlights` (`bookmarkId`);--> statement-breakpoint
CREATE INDEX `highlights_userId_idx` ON `highlights` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer,
	`expiresAt` integer NOT NULL,
	`usedAt` integer,
	`invitedBy` text NOT NULL,
	FOREIGN KEY (`invitedBy`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "email", "token", "createdAt", "expiresAt", "usedAt", "invitedBy") SELECT "id", "email", "token", "createdAt", "expiresAt", "usedAt", "invitedBy" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
CREATE UNIQUE INDEX `invites_token_unique` ON `invites` (`token`);--> statement-breakpoint
CREATE TABLE `__new_passwordResetToken` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passwordResetToken`("id", "userId", "token", "expires", "createdAt") SELECT "id", "userId", "token", "expires", "createdAt" FROM `passwordResetToken`;--> statement-breakpoint
DROP TABLE `passwordResetToken`;--> statement-breakpoint
ALTER TABLE `__new_passwordResetToken` RENAME TO `passwordResetToken`;--> statement-breakpoint
CREATE UNIQUE INDEX `passwordResetToken_token_unique` ON `passwordResetToken` (`token`);--> statement-breakpoint
CREATE INDEX `passwordResetTokens_userId_idx` ON `passwordResetToken` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_rssFeedImports` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer,
	`entryId` text NOT NULL,
	`rssFeedId` text NOT NULL,
	`bookmarkId` text,
	FOREIGN KEY (`rssFeedId`) REFERENCES `rssFeeds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bookmarkId`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_rssFeedImports`("id", "createdAt", "entryId", "rssFeedId", "bookmarkId") SELECT "id", "createdAt", "entryId", "rssFeedId", "bookmarkId" FROM `rssFeedImports`;--> statement-breakpoint
DROP TABLE `rssFeedImports`;--> statement-breakpoint
ALTER TABLE `__new_rssFeedImports` RENAME TO `rssFeedImports`;--> statement-breakpoint
CREATE INDEX `rssFeedImports_feedIdIdx_idx` ON `rssFeedImports` (`rssFeedId`);--> statement-breakpoint
CREATE INDEX `rssFeedImports_entryIdIdx_idx` ON `rssFeedImports` (`entryId`);--> statement-breakpoint
CREATE UNIQUE INDEX `rssFeedImports_rssFeedId_entryId_unique` ON `rssFeedImports` (`rssFeedId`,`entryId`);--> statement-breakpoint
CREATE TABLE `__new_rssFeeds` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`createdAt` integer,
	`lastFetchedAt` integer,
	`lastFetchedStatus` text DEFAULT 'pending',
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rssFeeds`("id", "name", "url", "enabled", "createdAt", "lastFetchedAt", "lastFetchedStatus", "userId") SELECT "id", "name", "url", "enabled", "createdAt", "lastFetchedAt", "lastFetchedStatus", "userId" FROM `rssFeeds`;--> statement-breakpoint
DROP TABLE `rssFeeds`;--> statement-breakpoint
ALTER TABLE `__new_rssFeeds` RENAME TO `rssFeeds`;--> statement-breakpoint
CREATE INDEX `rssFeeds_userId_idx` ON `rssFeeds` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`stripeCustomerId` text NOT NULL,
	`stripeSubscriptionId` text,
	`status` text NOT NULL,
	`tier` text DEFAULT 'free' NOT NULL,
	`priceId` text,
	`cancelAtPeriodEnd` integer DEFAULT false,
	`startDate` integer,
	`endDate` integer,
	`createdAt` integer,
	`modifiedAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_subscriptions`("id", "userId", "stripeCustomerId", "stripeSubscriptionId", "status", "tier", "priceId", "cancelAtPeriodEnd", "startDate", "endDate", "createdAt", "modifiedAt") SELECT "id", "userId", "stripeCustomerId", "stripeSubscriptionId", "status", "tier", "priceId", "cancelAtPeriodEnd", "startDate", "endDate", "createdAt", "modifiedAt" FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_userId_unique` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `subscriptions_userId_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `subscriptions_stripeCustomerId_idx` ON `subscriptions` (`stripeCustomerId`);--> statement-breakpoint
CREATE TABLE `__new_webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer,
	`url` text NOT NULL,
	`userId` text NOT NULL,
	`events` text NOT NULL,
	`token` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_webhooks`("id", "createdAt", "url", "userId", "events", "token") SELECT "id", "createdAt", "url", "userId", "events", "token" FROM `webhooks`;--> statement-breakpoint
DROP TABLE `webhooks`;--> statement-breakpoint
ALTER TABLE `__new_webhooks` RENAME TO `webhooks`;--> statement-breakpoint
CREATE INDEX `webhooks_userId_idx` ON `webhooks` (`userId`);--> statement-breakpoint
ALTER TABLE `account` ADD `createdAt` integer;--> statement-breakpoint
ALTER TABLE `account` ADD `updatedAt` integer DEFAULT (CURRENT_TIMESTAMP);--> statement-breakpoint
ALTER TABLE `session` ADD `createdAt` integer;--> statement-breakpoint
ALTER TABLE `session` ADD `updatedAt` integer DEFAULT (CURRENT_TIMESTAMP);--> statement-breakpoint
ALTER TABLE `user` ADD `createdAt` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `updatedAt` integer DEFAULT (CURRENT_TIMESTAMP);