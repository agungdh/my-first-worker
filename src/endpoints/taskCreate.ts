import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../shared/types";
import { Task } from "../types";
import { success } from "../shared/http";

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

		const service = c.get("services").tasks;
		const task = await service.create({
			name: taskToCreate.name,
			slug: taskToCreate.slug,
			description: taskToCreate.description,
			completed: taskToCreate.completed,
			due_date: taskToCreate.due_date,
		});

		return c.json(success({ task }), 201);
	}
}