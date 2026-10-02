CREATE TABLE `support_links` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text DEFAULT 'other' NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_links_active_position` ON `support_links` (`is_active`,`position`);