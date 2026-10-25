import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success } from "../../shared/http";
import {
	ImageCreateSchema,
	ImagePresignSchema,
	ImageSchema,
	ImageUpdateSchema,
	PresignedUploadSchema,
} from "./image.schema";

const ImageResponseSchema = z.object({
	success: z.boolean(),
	image: ImageSchema,
});

const SuccessSchema = z.object({
	success: z.boolean(),
});

const ImageParamsSchema = z.object({
	imageId: z.coerce.number().int().positive().describe("Image id"),
});

class ImagePresign extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "Get a presigned URL to upload a compressed image",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ImagePresignSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns a short-lived presigned PUT URL",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							upload: PresignedUploadSchema,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const upload = await c.get("services").images.presignUpload(data.body);

		return success({ upload });
	}
}

class ImageCreate extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "Save an uploaded image",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ImageCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Image created",
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

		await c.get("services").images.create(data.body);

		return c.json(success({}), 201);
	}
}

class ImageList extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "List images",
		request: {
			query: z.object({
				page: z.number().default(0).describe("Page number"),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of images",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							images: ImageSchema.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const images = await c.get("services").images.list(data.query.page);

		return success({ images });
	}
}

class ImageFetch extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "Get a single image",
		request: {
			params: ImageParamsSchema,
		},
		responses: {
			"200": {
				description: "Returns a single image if found",
				content: {
					"application/json": {
						schema: ImageResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const image = await c.get("services").images.get(data.params.imageId);

		return success({ image });
	}
}

class ImageUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "Replace or rename an image",
		request: {
			params: ImageParamsSchema,
			body: {
				content: {
					"application/json": {
						schema: ImageUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Image updated",
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

		await c.get("services").images.update(data.params.imageId, data.body);

		return success({});
	}
}

class ImageDelete extends OpenAPIRoute {
	schema = {
		tags: ["Images"],
		summary: "Delete an image",
		request: {
			params: ImageParamsSchema,
		},
		responses: {
			"200": {
				description: "Returns the deleted image",
				content: {
					"application/json": {
						schema: ImageResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const image = await c.get("services").images.delete(data.params.imageId);

		return success({ image });
	}
}

export function registerImageRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.post("/api/images/presign", ImagePresign);
	openapi.get("/api/images", ImageList);
	openapi.post("/api/images", ImageCreate);
	openapi.get("/api/images/:imageId", ImageFetch);
	openapi.put("/api/images/:imageId", ImageUpdate);
	openapi.delete("/api/images/:imageId", ImageDelete);
}
