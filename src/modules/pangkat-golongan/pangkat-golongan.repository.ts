import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import { pangkatGolongans, users } from "../../db/schema";
import { PAGE_SIZE } from "../../shared/config";
import { buildPage, keysetCondition, type Page } from "../../shared/pagination";
import type {
	PangkatGolongan,
	PangkatGolonganFilter,
	PangkatGolonganInput,
} from "./pangkat-golongan.domain";

type PangkatGolonganColumns = {
	id: typeof pangkatGolongans.id;
	jenjang: typeof pangkatGolongans.jenjang;
	pangkat: typeof pangkatGolongans.pangkat;
	golongan: typeof pangkatGolongans.golongan;
	ruang: typeof pangkatGolongans.ruang;
};

const columns: PangkatGolonganColumns = {
	id: pangkatGolongans.id,
	jenjang: pangkatGolongans.jenjang,
	pangkat: pangkatGolongans.pangkat,
	golongan: pangkatGolongans.golongan,
	ruang: pangkatGolongans.ruang,
};

export class PangkatGolonganRepository extends BaseRepository<typeof pangkatGolongans> {
	constructor(d1: D1Database) {
		super(d1, pangkatGolongans);
	}

	async list(filter: PangkatGolonganFilter): Promise<Page<PangkatGolongan>> {
		const conditions =
			filter.id === undefined
				? []
				: [keysetCondition(pangkatGolongans.id, filter.id, filter.sort)];

		const direction = filter.sort === "asc" ? asc : desc;

		const rows = await this.db
			.select(columns)
			.from(pangkatGolongans)
			.where(this.liveWhere(...conditions))
			.orderBy(direction(pangkatGolongans.id))
			.limit(PAGE_SIZE + 1);

		return buildPage(rows, (row) => row.id);
	}

	async findById(id: number): Promise<PangkatGolongan | null> {
		const row = await this.db
			.select(columns)
			.from(pangkatGolongans)
			.where(this.liveWhere(eq(pangkatGolongans.id, id)))
			.get();

		return row ?? null;
	}

	async create(input: PangkatGolonganInput, actorId: number): Promise<void> {
		await this.db.insert(pangkatGolongans).values({
			...input,
			...auditCreate(actorId),
		});
	}

	async update(id: number, input: PangkatGolonganInput, actorId: number): Promise<void> {
		await this.db
			.update(pangkatGolongans)
			.set({ ...input, ...auditUpdate(actorId) })
			.where(this.liveWhere(eq(pangkatGolongans.id, id)));
	}

	async softDelete(id: number, actorId: number): Promise<void> {
		await this.db
			.update(pangkatGolongans)
			.set(auditDelete(actorId))
			.where(this.liveWhere(eq(pangkatGolongans.id, id)));
	}

	async countLivePegawai(id: number): Promise<number> {
		const [row] = await this.db
			.select({ count: sql<number>`count(*)` })
			.from(users)
			.where(and(isNull(users.deletedAt), eq(users.pangkatGolonganId, id)));

		return row?.count ?? 0;
	}
}
