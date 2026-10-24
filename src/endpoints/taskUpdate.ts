import { NotFoundException, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { type AppContext, Task } from "../types";
import { createDb } from "../db";
import { tasks } from "../db/schema";

export class TaskUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Update a Task",
		request: {
			params: z.object({
				taskSlug: z.string().describe("Task slug"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string().optional(),
							slug: z.string().optional(),
							description: z.string().optional(),
							completed: z.boolean().optional(),
							due_date: z.iso.date().optional(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated task",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							task: Task,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const { taskSlug } = data.params;
		const updates = data.body;

		const db = createDb(c.env.DB);

		const setValues: Record<string, unknown> = {};
		if (updates.name !== undefined) setValues.name = updates.name;
		if (updates.slug !== undefined) setValues.slug = updates.slug;
		if (updates.description !== undefined) setValues.description = updates.description;
		if (updates.completed !== undefined) setValues.completed = updates.completed;
		if (updates.due_date !== undefined) setValues.dueDate = updates.due_date;

		const [updated] = await db
			.update(tasks)
			.set(setValues)
			.where(eq(tasks.slug, taskSlug))
			.returning();

		if (!updated) {
			throw new NotFoundException();
		}

		return {
			success: true,
			task: {
				name: updated.name,
				slug: updated.slug,
				description: updated.description ?? undefined,
				completed: updated.completed,
				due_date: updated.dueDate,
			},
		};
	}
}