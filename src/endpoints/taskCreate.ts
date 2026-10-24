import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Task } from "../types";
import { createDb } from "../db";
import { tasks } from "../db/schema";

export class TaskCreate extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Create a new Task",
		request: {
			body: {
				content: {
					"application/json": {
						schema: Task,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created task",
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

		const taskToCreate = data.body;

		const db = createDb(c.env.DB);

		const [created] = await db
			.insert(tasks)
			.values({
				name: taskToCreate.name,
				slug: taskToCreate.slug,
				description: taskToCreate.description,
				completed: taskToCreate.completed,
				dueDate: taskToCreate.due_date,
			})
			.returning();

		if (!created) {
			throw new Error("Failed to create task");
		}

		return c.json(
			{
				success: true,
				task: {
					name: created.name,
					slug: created.slug,
					description: created.description ?? undefined,
					completed: created.completed,
					due_date: created.dueDate,
				},
			},
			201,
		);
	}
}