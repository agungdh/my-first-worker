import { NotFoundException, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../shared/types";
import { Task } from "../types";
import { success } from "../shared/http";

export class TaskFetch extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Get a single Task by slug",
		request: {
			params: z.object({
				taskSlug: z.string().describe("Task slug"),
			}),
		},
		responses: {
			"200": {
				description: "Returns a single task if found",
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

		const task = await c.get("services").tasks.get(taskSlug);

		return success({ task });
	}
}