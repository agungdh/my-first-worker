import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../shared/types";
import { Task } from "../types";
import { success } from "../shared/http";

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

		const tasks = await c.get("services").tasks.list(page, isCompleted);

		return success({ tasks });
	}
}