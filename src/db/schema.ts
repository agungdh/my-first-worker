import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { auditColumns } from "./audit";

export const tasks = sqliteTable("tasks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	completed: integer("completed", { mode: "boolean" }).notNull().default(false),
	dueDate: text("due_date").notNull(),
	...auditColumns,
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;