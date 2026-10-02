CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text DEFAULT '' NOT NULL,
	CONSTRAINT "site_settings_singleton" CHECK("site_settings"."id" = 1)
);
