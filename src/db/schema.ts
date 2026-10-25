import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { auditColumns } from "./audit";

export const bidangs = sqliteTable(
	"bidangs",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		bidang: text("bidang").notNull(),
		...auditColumns,
	},
	(table) => [
		uniqueIndex("bidangs_bidang_unique")
			.on(sql`lower(${table.bidang})`)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export type BidangRow = typeof bidangs.$inferSelect;
export type NewBidangRow = typeof bidangs.$inferInsert;

export const pangkatGolongans = sqliteTable(
	"pangkat_golongans",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		jenjang: text("jenjang").notNull(),
		pangkat: text("pangkat").notNull(),
		golongan: text("golongan").notNull(),
		ruang: text("ruang").notNull(),
		...auditColumns,
	},
	(table) => [
		uniqueIndex("pangkat_golongans_unique")
			.on(sql`lower(${table.pangkat})`, sql`lower(${table.golongan})`, sql`lower(${table.ruang})`)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export type PangkatGolonganRow = typeof pangkatGolongans.$inferSelect;
export type NewPangkatGolonganRow = typeof pangkatGolongans.$inferInsert;

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		nip: text("nip").notNull(),
		nama: text("nama").notNull(),
		passwordHash: text("password_hash").notNull(),
		role: text("role").notNull(),
		status: text("status").notNull(),
		bidangId: integer("bidang_id")
			.notNull()
			.references(() => bidangs.id),
		pangkatGolonganId: integer("pangkat_golongan_id").references(() => pangkatGolongans.id),
		jabatan: text("jabatan"),
		peran: text("peran"),
		kategoriJabatan: text("kategori_jabatan"),
		kategoriKebutuhanJamPelatihan: text("kategori_kebutuhan_jam_pelatihan"),
		...auditColumns,
	},
	(table) => [
		uniqueIndex("users_nip_unique")
			.on(sql`lower(${table.nip})`)
			.where(sql`${table.deletedAt} IS NULL`),
		index("users_role_idx").on(table.role),
		index("users_status_idx").on(table.status),
		index("users_bidang_id_idx").on(table.bidangId),
	],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
