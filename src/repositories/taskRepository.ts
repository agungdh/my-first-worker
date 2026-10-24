import { eq } from "drizzle-orm";
import { createDb } from "../db";
import { tasks } from "../db/schema";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../domain/task";

export class TaskRepository {
	private db: ReturnType<typeof createDb>;

	constructor(d1: D1Database) {
		this.db = createDb(d1);
	}

	async list(page: number, isCompleted?: boolean): Promise<Task[]> {
		const pageSize = 20;
		let query = this.db.select().from(tasks);
		if (isCompleted !== undefined) {
			query = query.where(eq(tasks.completed, isCompleted)) as typeof query;
		}
		const rows = await query.limit(pageSize).offset(page * pageSize).all();
		return rows.map((row) => ({
			name: row.name,
			slug: row.slug,
			description: row.description ?? undefined,
			completed: row.completed,
			due_date: row.dueDate,
		}));
	}

	async getBySlug(slug: string): Promise<Task | null> {
		const row = await this.db.select().from(tasks).where(eq(tasks.slug, slug)).get();
		if (!row) return null;
		return {
			name: row.name,
			slug: row.slug,
			description: row.description ?? undefined,
			completed: row.completed,
			due_date: row.dueDate,
		};
	}

	async create(input: CreateTaskInput): Promise<Task> {
		const [created] = await this.db
			.insert(tasks)
			.values({
				name: input.name,
				slug: input.slug,
				description: input.description,
				completed: input.completed,
				dueDate: input.due_date,
			})
			.returning();

		if (!created) throw new Error("Failed to create task");

		return {
			name: created.name,
			slug: created.slug,
			description: created.description ?? undefined,
			completed: created.completed,
			due_date: created.dueDate,
		};
	}

	async update(slug: string, input: UpdateTaskInput): Promise<Task | null> {
		const setValues: Record<string, unknown> = {};
		if (input.name !== undefined) setValues.name = input.name;
		if (input.slug !== undefined) setValues.slug = input.slug;
		if (input.description !== undefined) setValues.description = input.description;
		if (input.completed !== undefined) setValues.completed = input.completed;
		if (input.due_date !== undefined) setValues.dueDate = input.due_date;

		const [updated] = await this.db
			.update(tasks)
			.set(setValues)
			.where(eq(tasks.slug, slug))
			.returning();

		if (!updated) return null;

		return {
			name: updated.name,
			slug: updated.slug,
			description: updated.description ?? undefined,
			completed: updated.completed,
			due_date: updated.dueDate,
		};
	}

	async delete(slug: string): Promise<boolean> {
		const [deleted] = await this.db.delete(tasks).where(eq(tasks.slug, slug)).returning();
		return !!deleted;
	}
}