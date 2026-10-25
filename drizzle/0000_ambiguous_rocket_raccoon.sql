CREATE TABLE `bidangs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bidang` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`deleted_by` integer
);
--> statement-breakpoint
CREATE TABLE `pangkat_golongans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`jenjang` text NOT NULL,
	`pangkat` text NOT NULL,
	`golongan` text NOT NULL,
	`ruang` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`deleted_by` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nip` text NOT NULL,
	`nama` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`bidang_id` integer NOT NULL,
	`pangkat_golongan_id` integer,
	`jabatan` text,
	`peran` text,
	`kategori_jabatan` text,
	`kategori_kebutuhan_jam_pelatihan` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`created_by` integer,
	`updated_by` integer,
	`deleted_by` integer,
	FOREIGN KEY (`bidang_id`) REFERENCES `bidangs`(`id`) ON UPDATE restrict ON DELETE restrict,
	FOREIGN KEY (`pangkat_golongan_id`) REFERENCES `pangkat_golongans`(`id`) ON UPDATE restrict ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_nip_unique` ON `users` (lower("nip")) WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);--> statement-breakpoint
CREATE INDEX `users_bidang_id_idx` ON `users` (`bidang_id`);