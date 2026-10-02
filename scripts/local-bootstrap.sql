-- Local-only, idempotent schema bootstrap for `npm run dev` and `npm run start`.
-- Docker and production deployments continue to use the versioned Drizzle migrations.

CREATE TABLE IF NOT EXISTS `articles` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `excerpt` text DEFAULT '' NOT NULL,
  `content` text DEFAULT '' NOT NULL,
  `category` text DEFAULT 'Journal de bord' NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `cover_media_id` text,
  `published_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `articles_slug_unique` ON `articles` (`slug`);
CREATE INDEX IF NOT EXISTS `idx_articles_status_published_at`
  ON `articles` (`status`, `published_at`);

CREATE TABLE IF NOT EXISTS `media` (
  `id` text PRIMARY KEY NOT NULL,
  `object_key` text NOT NULL,
  `file_name` text NOT NULL,
  `content_type` text NOT NULL,
  `alt_text` text DEFAULT '' NOT NULL,
  `caption` text DEFAULT '' NOT NULL,
  `created_at` text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `media_object_key_unique` ON `media` (`object_key`);
CREATE INDEX IF NOT EXISTS `idx_media_created_at` ON `media` (`created_at`);

CREATE TABLE IF NOT EXISTS `project_updates` (
  `id` text PRIMARY KEY NOT NULL,
  `period` text NOT NULL,
  `title` text NOT NULL,
  `summary` text DEFAULT '' NOT NULL,
  `status` text DEFAULT 'upcoming' NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  `image_media_id` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_project_updates_position`
  ON `project_updates` (`position`);
CREATE INDEX IF NOT EXISTS `idx_project_updates_status`
  ON `project_updates` (`status`);

CREATE TABLE IF NOT EXISTS `support_links` (
  `id` text PRIMARY KEY NOT NULL,
  `provider` text DEFAULT 'other' NOT NULL,
  `label` text NOT NULL,
  `url` text NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_support_links_active_position`
  ON `support_links` (`is_active`, `position`);

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` integer PRIMARY KEY NOT NULL,
  `content` text NOT NULL,
  `updated_at` text NOT NULL,
  `updated_by` text DEFAULT '' NOT NULL,
  CONSTRAINT `site_settings_singleton` CHECK(`site_settings`.`id` = 1)
);
