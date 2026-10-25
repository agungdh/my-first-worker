import type { HonoOpenAPIRouterType } from "chanfana";
import { registerTaskRoutes } from "../modules/task/task.routes";
import { registerTestingRoutes } from "../modules/testing/testing.routes";

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	registerTaskRoutes(openapi);
	registerTestingRoutes(openapi);
}
