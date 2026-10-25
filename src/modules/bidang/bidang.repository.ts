import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import { bidangs, users } from "../../db/schema";
import { PAGE_SIZE } from "../../shared/config";
import { buildPage, keysetCondition, type Page } from "../../shared/pagination";
import type { Bidang, BidangFilter, BidangInput } from "./bidang.domain";

export class BidangRepository extends BaseRepository<typeof bidangs> {
	constructor(d1: D1Database) {
		super(d1, bidangs);
	}

	async list(filter: BidangFilter): Promise<Page<Bidang>> {
		const sortColumn = filter.sort === "bidang" ? bidangs.bidang : null;
		let sortValue: string | null = null;

		if (filter.id !== undefined && sortColumn) {
			const last = await this.db
				.select({ value: sortColumn })
				.from(bidangs)
				.where(eq(bidangs.id, filter.id))
				.get();

			if (!last) return { items: [], nextId: null, hasMore: false };
			sortValue = last.value;
		}

		const conditions =
			filter.id === undefined
				? []
				: [keysetCondition(sortColumn, sortValue, bidangs.id, filter.id, filter.order)];

		const direction = filter.order === "asc" ? asc : desc;
		const orderBy = sortColumn
			? [direction(sortColumn), direction(bidangs.id)]
			: [direction(bidangs.id)];

		const rows = await this.db
			.select({ id: bidangs.id, bidang: bidangs.bidang })
			.from(bidangs)
			.where(this.liveWhere(...conditions))
			.orderBy(...orderBy)
			.limit(PAGE_SIZE + 1);

		return buildPage(rows, (row) => row.id);
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
