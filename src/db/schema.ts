import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { auditColumns } from "./audit";

export const tasks = sqliteTable(
	"tasks",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		description: text("description"),
		completed: integer("completed", { mode: "boolean" }).notNull().default(false),
		dueDate: text("due_date").notNull(),
		...auditColumns,
	},
	(table) => [
		uniqueIndex("tasks_slug_unique")
			.on(sql`lower(${table.slug})`)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

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
