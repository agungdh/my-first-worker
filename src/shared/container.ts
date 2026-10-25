import { UserRepository } from "../modules/user/user.repository";
import { UserService } from "../modules/user/user.service";

export interface Services {
	users: UserService;
}

export function buildServices(env: Env): Services {
	return {
		users: new UserService(new UserRepository(env.DB)),
	};
}
