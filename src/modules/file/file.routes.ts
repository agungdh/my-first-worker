import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success, SuccessSchema } from "../../shared/http";
import {
	FileCreateSchema,
	FilePresignSchema,
	FileSchema,
	FileUpdateSchema,
	PresignedUploadSchema,
} from "./file.schema";

const FileResponseSchema = z.object({
	success: z.boolean(),
	file: FileSchema,
});

const FileParamsSchema = z.object({
	fileId: z.coerce.number().int().positive().describe("File id"),
});

class FilePresign extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "Get a presigned URL to upload a file",
		request: {
			body: {
				content: {
					"application/json": {
						schema: FilePresignSchema,
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

		const upload = await c.get("services").files.presignUpload(data.body);

		return success({ upload });
	}
}

class FileCreate extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "Save an uploaded file",
		request: {
			body: {
				content: {
					"application/json": {
						schema: FileCreateSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "File created",
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

		await c.get("services").files.create(data.body);

		return c.json(success({}), 201);
	}
}

class FileList extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "List files",
		request: {
			query: z.object({
				page: z.number().default(0).describe("Page number"),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of files",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							files: FileSchema.array(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const files = await c.get("services").files.list(data.query.page);

		return success({ files });
	}
}

class FileFetch extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "Get a single file",
		request: {
			params: FileParamsSchema,
		},
		responses: {
			"200": {
				description: "Returns a single file if found",
				content: {
					"application/json": {
						schema: FileResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const file = await c.get("services").files.get(data.params.fileId);

		return success({ file });
	}
}

class FileUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "Replace or rename a file",
		request: {
			params: FileParamsSchema,
			body: {
				content: {
					"application/json": {
						schema: FileUpdateSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "File updated",
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

		await c.get("services").files.update(data.params.fileId, data.body);

		return success({});
	}
}

class FileDelete extends OpenAPIRoute {
	schema = {
		tags: ["Files"],
		summary: "Delete a file",
		request: {
			params: FileParamsSchema,
		},
		responses: {
			"200": {
				description: "Returns the deleted file",
				content: {
					"application/json": {
						schema: FileResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const file = await c.get("services").files.delete(data.params.fileId);

		return success({ file });
	}
}

export function registerFileRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.post("/api/files/presign", FilePresign);
	openapi.get("/api/files", FileList);
	openapi.post("/api/files", FileCreate);
	openapi.get("/api/files/:fileId", FileFetch);
	openapi.put("/api/files/:fileId", FileUpdate);
	openapi.delete("/api/files/:fileId", FileDelete);
}