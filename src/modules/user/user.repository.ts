import { eq, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { users } from "../../db/schema";
import { auditCreate } from "../../db/audit";
import type { User } from "./user.domain";

export interface UserRecord extends User {
	passwordHash: string;
}

export interface CreateUserRecordInput {
	username: string;
	name: string;
	passwordHash: string;
}

export class UserRepository extends BaseRepository<typeof users> {
	constructor(d1: D1Database) {
		super(d1, users);
	}

	async findByUsername(username: string): Promise<UserRecord | null> {
		const row = await this.db
			.select({
				id: users.id,
				username: users.username,
				name: users.name,
				passwordHash: users.passwordHash,
			})
			.from(users)
			.where(this.liveWhere(eq(sql`lower(${users.username})`, username.toLowerCase())))
			.get();

		if (!row) return null;
		return this.toRecord(row);
	}

	async create(input: CreateUserRecordInput): Promise<User> {
		const [created] = await this.db
			.insert(users)
			.values({
				username: input.username,
				name: input.name,
				passwordHash: input.passwordHash,
				...auditCreate(),
			})
			.returning({
				id: users.id,
				username: users.username,
				name: users.name,
			});

		if (!created) throw new Error("Failed to create user");

		return this.toUser(created);
	}

	private toUser(row: Pick<typeof users.$inferSelect, "id" | "username" | "name">): User {
		return {
			id: row.id,
			username: row.username,
			name: row.name,
		};
	}

	private toRecord(row: Pick<typeof users.$inferSelect, "id" | "username" | "name" | "passwordHash">): UserRecord {
		return {
			...this.toUser(row),
			passwordHash: row.passwordHash,
		};
	}
}
