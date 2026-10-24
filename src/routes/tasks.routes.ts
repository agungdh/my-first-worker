import type { HonoOpenAPIRouterType } from "chanfana";
import { TaskCreate } from "../endpoints/taskCreate";
import { TaskDelete } from "../endpoints/taskDelete";
import { TaskFetch } from "../endpoints/taskFetch";
import { TaskList } from "../endpoints/taskList";
import { TaskUpdate } from "../endpoints/taskUpdate";

export function registerTaskRoutes(openapi: HonoOpenAPIRouterType<any>) {
	openapi.get("/api/tasks", TaskList);
	openapi.post("/api/tasks", TaskCreate);
	openapi.get("/api/tasks/:taskSlug", TaskFetch);
	openapi.put("/api/tasks/:taskSlug", TaskUpdate);
	openapi.delete("/api/tasks/:taskSlug", TaskDelete);
}