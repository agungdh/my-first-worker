import { ConflictException, UnauthorizedException } from "chanfana";
import { UserRepository } from "./user.repository";
import { hashPassword, verifyPassword } from "./user.password";
import type { CreateUserInput, LoginInput, User } from "./user.domain";

export class UserService {
	constructor(private readonly repo: UserRepository) {}

	async register(input: CreateUserInput): Promise<User> {
		const existing = await this.repo.findByUsername(input.username);
		if (existing) throw new ConflictException();

		return this.repo.create({
			username: input.username,
			name: input.name,
			passwordHash: await hashPassword(input.password),
		});
	}

	async login(input: LoginInput): Promise<User> {
		const record = await this.repo.findByUsername(input.username);
		if (!record || !(await verifyPassword(input.password, record.passwordHash))) {
			throw new UnauthorizedException();
		}

		return { id: record.id, username: record.username, name: record.name };
	}

	async find(id: number): Promise<User | null> {
		return this.repo.findById(id);
	}
}
