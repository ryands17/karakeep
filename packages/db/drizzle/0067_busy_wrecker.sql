CREATE TABLE `verification` (
	`identifier` text,
	`value` text,
	`expiresAt` integer,
	`createdAt` integer,
	`updatedAt` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
DROP TABLE `passwordResetToken`;--> statement-breakpoint
DROP TABLE `verificationToken`;--> statement-breakpoint
ALTER TABLE `account` ADD `refreshTokenExpiresAt` integer;--> statement-breakpoint
ALTER TABLE `session` ADD `ipAddress` text;--> statement-breakpoint
ALTER TABLE `session` ADD `userAgent` text;