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
			.select()
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
			.returning();

		if (!created) throw new Error("Failed to create user");

		return this.toUser(created);
	}

	private toUser(row: typeof users.$inferSelect): User {
		return {
			id: row.id,
			username: row.username,
			name: row.name,
		};
	}

	private toRecord(row: typeof users.$inferSelect): UserRecord {
		return {
			...this.toUser(row),
			passwordHash: row.passwordHash,
		};
	}
}
