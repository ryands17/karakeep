CREATE TABLE `globalSettings` (
	`name` text NOT NULL,
	`value` integer,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `globalSettings_name_unique` ON `globalSettings` (`name`);