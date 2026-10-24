import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../shared/types";
import { Task } from "../types";
import { success } from "../shared/http";

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

		const task = await c.get("services").tasks.update(taskSlug, updates);

		return success({ task });
	}
}