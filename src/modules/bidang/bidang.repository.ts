import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import { bidangs, users } from "../../db/schema";
import { PAGE_SIZE } from "../../shared/config";
import type { Bidang, BidangInput } from "./bidang.domain";

export class BidangRepository extends BaseRepository<typeof bidangs> {
	constructor(d1: D1Database) {
		super(d1, bidangs);
	}

	async list(page: number): Promise<Bidang[]> {
		return this.db
			.select({ id: bidangs.id, bidang: bidangs.bidang })
			.from(bidangs)
			.where(this.liveWhere())
			.orderBy(asc(bidangs.bidang))
			.limit(PAGE_SIZE)
			.offset(page * PAGE_SIZE);
	}

	async findById(id: number): Promise<Bidang | null> {
		const row = await this.db
			.select({ id: bidangs.id, bidang: bidangs.bidang })
			.from(bidangs)
			.where(this.liveWhere(eq(bidangs.id, id)))
			.get();

		return row ?? null;
	}

	async create(input: BidangInput, actorId: number): Promise<void> {
		await this.db.insert(bidangs).values({
			bidang: input.bidang,
			...auditCreate(actorId),
		});
	}

	async update(id: number, input: BidangInput, actorId: number): Promise<void> {
		await this.db
			.update(bidangs)
			.set({ bidang: input.bidang, ...auditUpdate(actorId) })
			.where(this.liveWhere(eq(bidangs.id, id)));
	}

	async softDelete(id: number, actorId: number): Promise<void> {
		await this.db
			.update(bidangs)
			.set(auditDelete(actorId))
			.where(this.liveWhere(eq(bidangs.id, id)));
	}

	async countLivePegawai(id: number): Promise<number> {
		const [row] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(and(isNull(users.deletedAt), eq(users.bidangId, id)));

		return row?.count ?? 0;
	}
}
