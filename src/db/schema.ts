import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { auditColumns } from "./audit";

export const users = sqliteTable(
	"users",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		username: text("username").notNull(),
		name: text("name").notNull(),
		passwordHash: text("password_hash").notNull(),
		...auditColumns,
	},
	(table) => [
		uniqueIndex("users_username_unique")
			.on(sql`lower(${table.username})`)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
