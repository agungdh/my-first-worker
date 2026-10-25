import { TaskRepository } from "../modules/task/task.repository";
import { TaskService } from "../modules/task/task.service";

export interface Services {
	tasks: TaskService;
}

export function buildServices(env: Env): Services {
	return { tasks: new TaskService(new TaskRepository(env.DB)) };
}