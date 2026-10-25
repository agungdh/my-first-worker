import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success, SuccessSchema } from "../../shared/http";
import {
	PangkatGolonganInputSchema,
	PangkatGolonganListQuerySchema,
	PangkatGolonganListSchema,
	PangkatGolonganSchema,
} from "./pangkat-golongan.schema";

class PangkatGolonganList extends OpenAPIRoute {
	schema = {
		tags: ["Pangkat Golongan"],
		summary: "List pangkat golongan",
		request: {
			query: PangkatGolonganListQuerySchema,
		},
		responses: {
			"200": {
				description: "Returns a page of pangkat golongan",
				content: {
					"application/json": {
						schema: PangkatGolonganListSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const query = data.query;
		const page = await c.get("services").pangkatGolongan.list({
			id: query.id,
			sort: query.sort,
			order: query.order,
		});

		return success({
			pangkat_golongan: page.items,
			next_id: page.nextId,
			has_more: page.hasMore,
		});
	}
}

class PangkatGolonganFetch extends OpenAPIRoute {
	schema = {
		tags: ["Pangkat Golongan"],
		summary: "Get a pangkat golongan by id",
		request: {
			params: z.object({
				pangkatGolonganId: z.number().describe("Pangkat golongan id"),
			}),
		},
		responses: {
			"200": {
				description: "Returns the pangkat golongan",
				content: {
					"application/json": {
						schema: z.object({ success: z.boolean(), pangkat_golongan: PangkatGolonganSchema }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const pangkat_golongan = await c
			.get("services")
			.pangkatGolongan.get(data.params.pangkatGolonganId);

		return success({ pangkat_golongan });
	}
}

class PangkatGolonganCreate extends OpenAPIRoute {
	schema = {
		tags: ["Pangkat Golongan"],
		summary: "Create a pangkat golongan",
		request: {
			body: {
				content: {
					"application/json": {
						schema: PangkatGolonganInputSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Pangkat golongan created",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		await c.get("services").pangkatGolongan.create(data.body, c.get("user")!.id);

		return c.json(success({}), 201);
	}
}

class PangkatGolonganUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Pangkat Golongan"],
		summary: "Replace a pangkat golongan",
		request: {
			params: z.object({
				pangkatGolonganId: z.number().describe("Pangkat golongan id"),
			}),
			body: {
				content: {
					"application/json": {
						schema: PangkatGolonganInputSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Pangkat golongan updated",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		await c
			.get("services")
			.pangkatGolongan.update(data.params.pangkatGolonganId, data.body, c.get("user")!.id);

		return success({});
	}
}

class PangkatGolonganDelete extends OpenAPIRoute {
	schema = {
		tags: ["Pangkat Golongan"],
		summary: "Delete a pangkat golongan",
		request: {
			params: z.object({
				pangkatGolonganId: z.number().describe("Pangkat golongan id"),
			}),
		},
		responses: {
			"200": {
				description: "Pangkat golongan deleted",
				content: {
					"application/json": {
						schema: SuccessSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		await c.get("services").pangkatGolongan.remove(data.params.pangkatGolonganId, c.get("user")!.id);

		return success({});
	}
}

export function registerPangkatGolonganRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.get("/api/pangkat-golongan", PangkatGolonganList);
	openapi.get("/api/pangkat-golongan/:pangkatGolonganId", PangkatGolonganFetch);
	openapi.post("/api/pangkat-golongan", PangkatGolonganCreate);
	openapi.put("/api/pangkat-golongan/:pangkatGolonganId", PangkatGolonganUpdate);
	openapi.delete("/api/pangkat-golongan/:pangkatGolonganId", PangkatGolonganDelete);
}
