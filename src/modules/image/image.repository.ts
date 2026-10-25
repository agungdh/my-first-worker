import { desc, eq, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { images } from "../../db/schema";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import type { Image, SaveImageInput } from "./image.domain";

export interface ImageRecordInput extends SaveImageInput {
	content_type: string;
	size: number;
}

export class ImageRepository extends BaseRepository<typeof images> {
	constructor(d1: D1Database) {
		super(d1, images);
	}

	async list(page: number): Promise<Image[]> {
		const pageSize = 20;
		const rows = await this.db
			.select()
			.from(images)
			.where(this.liveWhere())
			.orderBy(desc(images.id))
			.limit(pageSize)
			.offset(page * pageSize)
			.all();

		return rows.map((row) => this.toImage(row));
	}

	async findById(id: number): Promise<Image | null> {
		const row = await this.db
			.select()
			.from(images)
			.where(this.liveWhere(eq(images.id, id)))
			.get();

		if (!row) return null;
		return this.toImage(row);
	}

	async findByKey(key: string): Promise<Image | null> {
		const row = await this.db
			.select()
			.from(images)
			.where(this.liveWhere(eq(sql`lower(${images.key})`, key.toLowerCase())))
			.get();

		if (!row) return null;
		return this.toImage(row);
	}

	async create(input: ImageRecordInput): Promise<Image> {
		const [created] = await this.db
			.insert(images)
			.values({
				key: input.key,
				filename: input.filename,
				contentType: input.content_type,
				size: input.size,
				...auditCreate(),
			})
			.returning();

		if (!created) throw new Error("Failed to create image");

		return this.toImage(created);
	}

	async update(id: number, input: ImageRecordInput): Promise<Image | null> {
		const [updated] = await this.db
			.update(images)
			.set({
				key: input.key,
				filename: input.filename,
				contentType: input.content_type,
				size: input.size,
				...auditUpdate(),
			})
			.where(this.liveWhere(eq(images.id, id)))
			.returning();

		if (!updated) return null;

		return this.toImage(updated);
	}

	async delete(id: number): Promise<boolean> {
		const [deleted] = await this.db
			.update(images)
			.set(auditDelete())
			.where(this.liveWhere(eq(images.id, id)))
			.returning();

		return !!deleted;
	}

	private toImage(row: typeof images.$inferSelect): Image {
		return {
			id: row.id,
			key: row.key,
			filename: row.filename,
			content_type: row.contentType,
			size: row.size,
		};
	}
}
