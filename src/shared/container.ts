import { TaskRepository } from "../modules/task/task.repository";
import { TaskService } from "../modules/task/task.service";
import { UserRepository } from "../modules/user/user.repository";
import { UserService } from "../modules/user/user.service";

export interface Services {
	tasks: TaskService;
	users: UserService;
}

export function buildServices(env: Env): Services {
	return {
		tasks: new TaskService(new TaskRepository(env.DB)),
		users: new UserService(new UserRepository(env.DB)),
	};
}