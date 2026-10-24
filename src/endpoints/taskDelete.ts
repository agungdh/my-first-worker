import { NotFoundException, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { type AppContext, Task } from "../types";
import { createDb } from "../db";
import { tasks } from "../db/schema";

export class TaskDelete extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Delete a Task",
		request: {
			params: z.object({
				taskSlug: z.string().describe("Task slug"),
			}),
		},
		responses: {
			"200": {
				description: "Returns if the task was deleted successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							result: z.object({
								task: Task,
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const { taskSlug } = data.params;

		const db = createDb(c.env.DB);

		const [deleted] = await db
			.delete(tasks)
			.where(eq(tasks.slug, taskSlug))
			.returning();

		if (!deleted) {
			throw new NotFoundException();
		}

		return {
			result: {
				task: {
					name: deleted.name,
					slug: deleted.slug,
					description: deleted.description ?? undefined,
					completed: deleted.completed,
					due_date: deleted.dueDate,
				},
			},
			success: true,
		};
	}
}