import { type HonoOpenAPIRouterType, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../shared/types";
import { success } from "../../shared/http";
import {
	clearAuthCookie,
	setAuthCookie,
	signAuthToken,
} from "../../shared/auth";
import { UserLoginSchema, UserRegisterSchema, UserSchema } from "./user.schema";

const UserResponseSchema = z.object({
	success: z.boolean(),
	user: UserSchema,
});

class UserRegister extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Register a new user",
		request: {
			body: {
				content: {
					"application/json": {
						schema: UserRegisterSchema,
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Returns the created user and sets the auth cookie",
				content: {
					"application/json": {
						schema: UserResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const user = await c.get("services").users.register(data.body);

		const token = await signAuthToken(c.env.JWT_SECRET, user);
		setAuthCookie(c, token);

		return c.json(success({ user }), 201);
	}
}

class UserLogin extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Login and set the auth cookie",
		request: {
			body: {
				content: {
					"application/json": {
						schema: UserLoginSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the authenticated user and sets the auth cookie",
				content: {
					"application/json": {
						schema: UserResponseSchema,
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();

		const user = await c.get("services").users.login(data.body);

		const token = await signAuthToken(c.env.JWT_SECRET, user);
		setAuthCookie(c, token);

		return c.json(success({ user }));
	}
}

class UserLogout extends OpenAPIRoute {
	schema = {
		tags: ["Auth"],
		summary: "Clear the auth cookie",
		responses: {
			"200": {
				description: "Auth cookie cleared",
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
		clearAuthCookie(c);

		return c.json(success({}));
	}
}

export function registerUserRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.post("/api/auth/register", UserRegister);
	openapi.post("/api/auth/login", UserLogin);
	openapi.post("/api/auth/logout", UserLogout);
}
