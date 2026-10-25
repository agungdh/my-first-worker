import type { HonoOpenAPIRouterType } from "chanfana";
import { registerTaskRoutes } from "../modules/task/task.routes";

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	registerTaskRoutes(openapi);
}
