import type { HonoOpenAPIRouterType } from "chanfana";
import { registerUserRoutes } from "../modules/user/user.routes";

export function registerRoutes(openapi: HonoOpenAPIRouterType<any>) {
	registerUserRoutes(openapi);
}
