import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import { pangkatGolongans, users } from "../../db/schema";
import { PAGE_SIZE } from "../../shared/config";
import type { PangkatGolongan, PangkatGolonganInput } from "./pangkat-golongan.domain";

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

	async list(page: number): Promise<PangkatGolongan[]> {
		return this.db
			.select(columns)
			.from(pangkatGolongans)
			.where(this.liveWhere())
			.orderBy(asc(pangkatGolongans.golongan), asc(pangkatGolongans.ruang), asc(pangkatGolongans.pangkat))
			.limit(PAGE_SIZE)
			.offset(page * PAGE_SIZE);
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
