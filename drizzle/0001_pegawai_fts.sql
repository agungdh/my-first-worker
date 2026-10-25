-- Hand-written migration: drizzle-kit cannot generate FTS5 virtual tables.
-- Keep this file when squashing migrations; it must run after the users table exists.
CREATE VIRTUAL TABLE `pegawai_fts` USING fts5(
	`nama`,
	`nip`,
	content='users',
	content_rowid='id',
	tokenize='trigram'
);
--> statement-breakpoint
CREATE TRIGGER `users_fts_ai` AFTER INSERT ON `users` BEGIN
	INSERT INTO `pegawai_fts` (rowid, nama, nip) VALUES (new.id, new.nama, new.nip);
END;
--> statement-breakpoint
CREATE TRIGGER `users_fts_ad` AFTER DELETE ON `users` BEGIN
	INSERT INTO `pegawai_fts` (`pegawai_fts`, rowid, nama, nip) VALUES ('delete', old.id, old.nama, old.nip);
END;
--> statement-breakpoint
CREATE TRIGGER `users_fts_au` AFTER UPDATE ON `users` BEGIN
	INSERT INTO `pegawai_fts` (`pegawai_fts`, rowid, nama, nip) VALUES ('delete', old.id, old.nama, old.nip);
	INSERT INTO `pegawai_fts` (rowid, nama, nip) VALUES (new.id, new.nama, new.nip);
END;
