import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../shared/types";
import { Task } from "../types";
import { success } from "../shared/http";

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

		const task = await c.get("services").tasks.delete(taskSlug);

		return success({ task });
	}
}