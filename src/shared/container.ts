import { ImageRepository } from "../modules/image/image.repository";
import { ImageService } from "../modules/image/image.service";
import { ImageStorage } from "../modules/image/image.storage";
import { TaskRepository } from "../modules/task/task.repository";
import { TaskService } from "../modules/task/task.service";
import { UserRepository } from "../modules/user/user.repository";
import { UserService } from "../modules/user/user.service";

export interface Services {
	tasks: TaskService;
	users: UserService;
	images: ImageService;
}

export function buildServices(env: Env): Services {
	return {
		tasks: new TaskService(new TaskRepository(env.DB)),
		users: new UserService(new UserRepository(env.DB)),
		images: new ImageService(
			new ImageRepository(env.DB),
			new ImageStorage(env.IMAGES, {
				accountId: env.R2_ACCOUNT_ID,
				bucket: env.R2_BUCKET,
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			}),
		),
	};
}