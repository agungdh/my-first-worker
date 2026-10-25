import { desc, eq, sql } from "drizzle-orm";
import { PAGE_SIZE } from "../../shared/config";
import { BaseRepository } from "../../db/baseRepository";
import { files } from "../../db/schema";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import type { File, SaveFileInput } from "./file.domain";

export interface FileRecordInput extends SaveFileInput {
	content_type: string;
	size: number;
}

export class FileRepository extends BaseRepository<typeof files> {
	constructor(d1: D1Database) {
		super(d1, files);
	}

	async list(page: number): Promise<File[]> {
		const pageSize = PAGE_SIZE;
		const rows = await this.db
			.select({
				id: files.id,
				key: files.key,
				filename: files.filename,
				contentType: files.contentType,
				size: files.size,
			})
			.from(files)
			.where(this.liveWhere())
			.orderBy(desc(files.id))
			.limit(pageSize)
			.offset(page * pageSize)
			.all();

		return rows.map((row) => this.toFile(row));
	}

	async findById(id: number): Promise<File | null> {
		const row = await this.db
			.select({
				id: files.id,
				key: files.key,
				filename: files.filename,
				contentType: files.contentType,
				size: files.size,
			})
			.from(files)
			.where(this.liveWhere(eq(files.id, id)))
			.get();

		if (!row) return null;
		return this.toFile(row);
	}

	async findByKey(key: string): Promise<File | null> {
		const row = await this.db
			.select({
				id: files.id,
				key: files.key,
				filename: files.filename,
				contentType: files.contentType,
				size: files.size,
			})
			.from(files)
			.where(this.liveWhere(eq(sql`lower(${files.key})`, key.toLowerCase())))
			.get();

		if (!row) return null;
		return this.toFile(row);
	}

	async create(input: FileRecordInput): Promise<void> {
		await this.db
			.insert(files)
			.values({
				key: input.key,
				filename: input.filename,
				contentType: input.content_type,
				size: input.size,
				...auditCreate(),
			})
			.run();
	}

	async update(id: number, input: FileRecordInput): Promise<boolean> {
		const [updated] = await this.db
			.update(files)
			.set({
				key: input.key,
				filename: input.filename,
				contentType: input.content_type,
				size: input.size,
				...auditUpdate(),
			})
			.where(this.liveWhere(eq(files.id, id)))
			.returning({ id: files.id });

		return !!updated;
	}

	async delete(id: number): Promise<boolean> {
		const [deleted] = await this.db
			.update(files)
			.set(auditDelete())
			.where(this.liveWhere(eq(files.id, id)))
			.returning({ id: files.id });

		return !!deleted;
	}

	private toFile(row: Pick<typeof files.$inferSelect, "id" | "key" | "filename" | "contentType" | "size">): File {
		return {
			id: row.id,
			key: row.key,
			filename: row.filename,
			content_type: row.contentType,
			size: row.size,
		};
	}
}