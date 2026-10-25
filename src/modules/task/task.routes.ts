import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success } from "../../shared/http";
import { TaskSchema, TaskUpdateSchema } from "./task.schema";

class TaskCreate extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Create a new Task",
		request: {
			body: {
				content: {
					"application/json": {
						schema: TaskSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Task created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
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
		await service.create({
			name: taskToCreate.name,
			slug: taskToCreate.slug,
			description: taskToCreate.description,
			completed: taskToCreate.completed,
			due_date: taskToCreate.due_date,
		});

		return c.json(success({}), 201);
	}
}

class TaskList extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "List Tasks",
		request: {
			query: z.object({
				page: z.number().default(0).describe("Page number"),
				isCompleted: z.boolean().optional().describe("Filter by completed flag"),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of tasks",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							tasks: TaskSchema.array(),
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

class TaskFetch extends OpenAPIRoute {
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
							task: TaskSchema,
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

class TaskUpdate extends OpenAPIRoute {
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
						schema: TaskUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Task updated",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
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

		await c.get("services").tasks.update(taskSlug, updates);

		return success({});
	}
}

class TaskDelete extends OpenAPIRoute {
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
							task: TaskSchema,
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

export function registerTaskRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.get("/api/tasks", TaskList);
	openapi.post("/api/tasks", TaskCreate);
	openapi.get("/api/tasks/:taskSlug", TaskFetch);
	openapi.put("/api/tasks/:taskSlug", TaskUpdate);
	openapi.delete("/api/tasks/:taskSlug", TaskDelete);
}
