import type { HonoOpenAPIRouterType } from "chanfana";
import { registerTaskRoutes } from "./tasks.routes";

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	registerTaskRoutes(openapi);
}