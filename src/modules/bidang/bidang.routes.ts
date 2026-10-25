import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success, SuccessSchema } from "../../shared/http";
import {
	BidangInputSchema,
	BidangListQuerySchema,
	BidangListSchema,
	BidangSchema,
} from "./bidang.schema";

class BidangList extends OpenAPIRoute {
	schema = {
		tags: ["Bidang"],
		summary: "List bidang",
		request: {
			query: BidangListQuerySchema,
		},
		responses: {
			"200": {
				description: "Returns a page of bidang",
				content: {
					"application/json": {
						schema: BidangListSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const query = data.query;
		const page = await c.get("services").bidang.list({
			cursor: query.cursor,
			sort: query.sort,
			order: query.order,
		});

		return success({
			bidang: page.items,
			next_cursor: page.nextCursor,
			has_more: page.hasMore,
		});
	}
}

class BidangFetch extends OpenAPIRoute {
	schema = {
		tags: ["Bidang"],
		summary: "Get a bidang by id",
		request: {
			params: z.object({
				bidangId: z.number().describe("Bidang id"),
			}),
		},
		responses: {
			"200": {
				description: "Returns the bidang",
				content: {
					"application/json": {
						schema: z.object({ success: z.boolean(), bidang: BidangSchema }),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const bidang = await c.get("services").bidang.get(data.params.bidangId);

		return success({ bidang });
	}
}

class BidangCreate extends OpenAPIRoute {
	schema = {
		tags: ["Bidang"],
		summary: "Create a bidang",
		request: {
			body: {
				content: {
					"application/json": {
						schema: BidangInputSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Bidang created",
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

		await c.get("services").bidang.create(data.body, c.get("user")!.id);

		return c.json(success({}), 201);
	}
}

class BidangUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Bidang"],
		summary: "Replace a bidang",
		request: {
			params: z.object({
				bidangId: z.number().describe("Bidang id"),
			}),
			body: {
				content: {
					"application/json": {
						schema: BidangInputSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Bidang updated",
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

		await c.get("services").bidang.update(data.params.bidangId, data.body, c.get("user")!.id);

		return success({});
	}
}

class BidangDelete extends OpenAPIRoute {
	schema = {
		tags: ["Bidang"],
		summary: "Delete a bidang",
		request: {
			params: z.object({
				bidangId: z.number().describe("Bidang id"),
			}),
		},
		responses: {
			"200": {
				description: "Bidang deleted",
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

		await c.get("services").bidang.remove(data.params.bidangId, c.get("user")!.id);

		return success({});
	}
}

export function registerBidangRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.get("/api/bidang", BidangList);
	openapi.get("/api/bidang/:bidangId", BidangFetch);
	openapi.post("/api/bidang", BidangCreate);
	openapi.put("/api/bidang/:bidangId", BidangUpdate);
	openapi.delete("/api/bidang/:bidangId", BidangDelete);
}
