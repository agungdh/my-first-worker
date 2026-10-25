import type { HonoOpenAPIRouterType } from "chanfana";
import { registerImageRoutes } from "../modules/image/image.routes";
import { registerTaskRoutes } from "../modules/task/task.routes";
import { registerTestingRoutes } from "../modules/testing/testing.routes";
import { registerUserRoutes } from "../modules/user/user.routes";

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	registerImageRoutes(openapi);
	registerTaskRoutes(openapi);
	registerTestingRoutes(openapi);
	registerUserRoutes(openapi);
}
