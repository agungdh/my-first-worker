import { eq, sql } from "drizzle-orm";
import { BaseRepository } from "./baseRepository";
import { tasks } from "../db/schema";
import { auditCreate, auditDelete, auditUpdate } from "../db/audit";
import type { Task, CreateTaskInput, UpdateTaskInput } from "../domain/task";

export class TaskRepository extends BaseRepository<typeof tasks> {
	constructor(d1: D1Database) {
		super(d1, tasks);
	}

	async list(page: number, isCompleted?: boolean): Promise<Task[]> {
		const pageSize = 20;
		const conditions = [];
		if (isCompleted !== undefined) {
			conditions.push(eq(tasks.completed, isCompleted));
		}
		const rows = await this.db
			.select()
			.from(tasks)
			.where(this.liveWhere(...conditions))
			.limit(pageSize)
			.offset(page * pageSize)
			.all();
		return rows.map((row) => this.toTask(row));
	}

	async getBySlug(slug: string): Promise<Task | null> {
		const row = await this.db
			.select()
			.from(tasks)
			.where(this.liveSlugWhere(slug))
			.get();
		if (!row) return null;
		return this.toTask(row);
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
				...auditCreate(),
			})
			.returning();

		if (!created) throw new Error("Failed to create task");

		return this.toTask(created);
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
			.set({ ...setValues, ...auditUpdate() })
			.where(this.liveSlugWhere(slug))
			.returning();

		if (!updated) return null;

		return this.toTask(updated);
	}

	async delete(slug: string): Promise<boolean> {
		const [deleted] = await this.db
			.update(tasks)
			.set(auditDelete())
			.where(this.liveSlugWhere(slug))
			.returning();
		return !!deleted;
	}

	private liveSlugWhere(slug: string) {
		return this.liveWhere(eq(sql`lower(${tasks.slug})`, slug.toLowerCase()));
	}

	private toTask(row: typeof tasks.$inferSelect): Task {
		return {
			name: row.name,
			slug: row.slug,
			description: row.description ?? undefined,
			completed: row.completed,
			due_date: row.dueDate,
		};
	}
}
