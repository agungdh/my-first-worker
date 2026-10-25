import { FileRepository } from "../modules/file/file.repository";
import { FileService } from "../modules/file/file.service";
import { FileStorage } from "../modules/file/file.storage";
import { ImageRepository } from "../modules/image/image.repository";
import { ImageService } from "../modules/image/image.service";
import { ImageStorage } from "../modules/image/image.storage";
import { TaskRepository } from "../modules/task/task.repository";
import { TaskService } from "../modules/task/task.service";
import { UserRepository } from "../modules/user/user.repository";
import { UserService } from "../modules/user/user.service";

export interface Services {
	files: FileService;
	tasks: TaskService;
	users: UserService;
	images: ImageService;
}

export function buildServices(env: Env): Services {
	return {
		files: new FileService(
			new FileRepository(env.DB),
			new FileStorage({
				accountId: env.R2_ACCOUNT_ID,
				bucket: env.R2_BUCKET,
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			}),
		),
		tasks: new TaskService(new TaskRepository(env.DB)),
		users: new UserService(new UserRepository(env.DB)),
		images: new ImageService(
			new ImageRepository(env.DB),
			new ImageStorage({
				accountId: env.R2_ACCOUNT_ID,
				bucket: env.R2_BUCKET,
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			}),
		),
	};
}