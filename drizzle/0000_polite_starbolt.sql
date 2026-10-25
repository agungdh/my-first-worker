CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`completed` integer DEFAULT false NOT NULL,
	`due_date` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`deleted_by` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_slug_unique` ON `tasks` (`slug`);