import { TaskRepository } from "../repositories/taskRepository";
import { TaskService } from "../services/taskService";

export interface Services {
	tasks: TaskService;
}

export function buildServices(env: Env): Services {
	return { tasks: new TaskService(new TaskRepository(env.DB)) };
}