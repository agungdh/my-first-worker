import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { type AppContext, Task } from "../types";
import { createDb } from "../db";
import { tasks } from "../db/schema";

export class TaskList extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "List Tasks",
		request: {
			query: z.object({
				page: z.number().default(0).describe("Page number"),
				isCompleted: z
					.boolean()
					.optional()
					.describe("Filter by completed flag"),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of tasks",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							tasks: Task.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const { page, isCompleted } = data.query;

		const db = createDb(c.env.DB);

		const pageSize = 20;
		let query = db.select().from(tasks);
		if (isCompleted !== undefined) {
			query = query.where(eq(tasks.completed, isCompleted)) as typeof query;
		}
		const rows = await query
			.limit(pageSize)
			.offset(page * pageSize)
			.all();

		const resultTasks = rows.map((row) => ({
			name: row.name,
			slug: row.slug,
			description: row.description ?? undefined,
			completed: row.completed,
			due_date: row.dueDate,
		}));

		return {
			success: true,
			tasks: resultTasks,
		};
	}
}