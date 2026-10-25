CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`deleted_by` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `images_key_unique` ON `images` (lower("key")) WHERE "images"."deleted_at" IS NULL;