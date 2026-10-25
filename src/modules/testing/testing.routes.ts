import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success } from "../../shared/http";
import { ValidationSampleSchema } from "./testing.schema";

class ValidationTest extends OpenAPIRoute {
	schema = {
		tags: ["Testing"],
		summary: "Echo a payload after running multi-message validation",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ValidationSampleSchema,
						example: {
							name: "ab",
							email: "not-an-email",
							password: "abc",
						},
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the validated payload",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: ValidationSampleSchema,
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		return success({ data: data.body });
	}
}

export function registerTestingRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.post("/api/testing/validation", ValidationTest);
}
