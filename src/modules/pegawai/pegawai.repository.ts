import { asc, eq, isNull, sql } from "drizzle-orm";
import { BaseRepository } from "../../db/baseRepository";
import { auditCreate, auditDelete, auditUpdate } from "../../db/audit";
import { bidangs, pangkatGolongans, users } from "../../db/schema";
import { PAGE_SIZE } from "../../shared/config";
import type {
	CreatePegawaiInput,
	Pegawai,
	PegawaiFilter,
	UpdatePegawaiInput,
} from "./pegawai.domain";
import type {
	KategoriJabatan,
	KategoriKebutuhanJamPelatihan,
	Role,
	Status,
} from "./pegawai.constants";

const selectColumns = {
	id: users.id,
	nip: users.nip,
	nama: users.nama,
	role: users.role,
	status: users.status,
	jabatan: users.jabatan,
	peran: users.peran,
	kategoriJabatan: users.kategoriJabatan,
	kategoriKebutuhanJamPelatihan: users.kategoriKebutuhanJamPelatihan,
	bidangId: bidangs.id,
	bidang: bidangs.bidang,
	pangkatGolonganId: users.pangkatGolonganId,
	pangkatJenjang: pangkatGolongans.jenjang,
	pangkatNama: pangkatGolongans.pangkat,
	pangkatGolongan: pangkatGolongans.golongan,
	pangkatRuang: pangkatGolongans.ruang,
};

export interface CreatePegawaiRecordInput extends CreatePegawaiInput {
	passwordHash: string;
}

export interface UpdatePegawaiRecordInput extends UpdatePegawaiInput {
	passwordHash?: string;
}

export interface AuthRecord {
	id: number;
	nip: string;
	nama: string;
	role: Role;
	status: Status;
	passwordHash: string;
}

export class PegawaiRepository extends BaseRepository<typeof users> {
	constructor(d1: D1Database) {
		super(d1, users);
	}

	async list(filter: PegawaiFilter): Promise<Pegawai[]> {
		const conditions = [];

		if (filter.search) {
			conditions.push(
				sql`${users.id} IN (SELECT rowid FROM pegawai_fts WHERE pegawai_fts MATCH ${toFtsQuery(filter.search)})`,
			);
		}
		if (filter.role) conditions.push(eq(users.role, filter.role));
		if (filter.status) conditions.push(eq(users.status, filter.status));
		if (filter.bidangId !== undefined) conditions.push(eq(users.bidangId, filter.bidangId));
		if (filter.pangkatGolonganId !== undefined) {
			conditions.push(eq(users.pangkatGolonganId, filter.pangkatGolonganId));
		}
		if (filter.kategoriJabatan) conditions.push(eq(users.kategoriJabatan, filter.kategoriJabatan));
		if (filter.kategoriKebutuhanJamPelatihan) {
			conditions.push(
				eq(users.kategoriKebutuhanJamPelatihan, filter.kategoriKebutuhanJamPelatihan),
			);
		}

		const rows = await this.db
			.select(selectColumns)
			.from(users)
			.innerJoin(bidangs, eq(bidangs.id, users.bidangId))
			.leftJoin(pangkatGolongans, eq(pangkatGolongans.id, users.pangkatGolonganId))
			.where(this.liveWhere(isNull(bidangs.deletedAt), ...conditions))
			.orderBy(asc(users.nama))
			.limit(PAGE_SIZE)
			.offset(filter.page * PAGE_SIZE);

		return rows.map(toPegawai);
	}

	async findById(id: number): Promise<Pegawai | null> {
		const row = await this.db
			.select(selectColumns)
			.from(users)
			.innerJoin(bidangs, eq(bidangs.id, users.bidangId))
			.leftJoin(pangkatGolongans, eq(pangkatGolongans.id, users.pangkatGolonganId))
			.where(this.liveWhere(eq(users.id, id)))
			.get();

		return row ? toPegawai(row) : null;
	}

	async findAuthByNip(nip: string): Promise<AuthRecord | null> {
		const row = await this.db
			.select({
				id: users.id,
				nip: users.nip,
				nama: users.nama,
				role: users.role,
				status: users.status,
				passwordHash: users.passwordHash,
			})
			.from(users)
			.where(this.liveWhere(eq(sql`lower(${users.nip})`, nip.toLowerCase())))
			.get();

		if (!row) return null;

		return {
			...row,
			role: row.role as Role,
			status: row.status as Status,
		};
	}

	async findIdByNip(nip: string): Promise<number | null> {
		const row = await this.db
			.select({ id: users.id })
			.from(users)
			.where(this.liveWhere(eq(sql`lower(${users.nip})`, nip.toLowerCase())))
			.get();

		return row?.id ?? null;
	}

	async create(input: CreatePegawaiRecordInput, actorId: number): Promise<void> {
		await this.db.insert(users).values({
			nip: input.nip,
			nama: input.nama,
			passwordHash: input.passwordHash,
			role: input.role,
			status: input.status,
			bidangId: input.bidangId,
			pangkatGolonganId: input.pangkatGolonganId,
			jabatan: input.jabatan,
			peran: input.peran,
			kategoriJabatan: input.kategoriJabatan,
			kategoriKebutuhanJamPelatihan: input.kategoriKebutuhanJamPelatihan,
			...auditCreate(actorId),
		});
	}

	async update(id: number, input: UpdatePegawaiRecordInput, actorId: number): Promise<void> {
		await this.db
			.update(users)
			.set({
				nip: input.nip,
				nama: input.nama,
				role: input.role,
				status: input.status,
				bidangId: input.bidangId,
				pangkatGolonganId: input.pangkatGolonganId,
				jabatan: input.jabatan,
				peran: input.peran,
				kategoriJabatan: input.kategoriJabatan,
				kategoriKebutuhanJamPelatihan: input.kategoriKebutuhanJamPelatihan,
				...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
				...auditUpdate(actorId),
			})
			.where(this.liveWhere(eq(users.id, id)));
	}

	async softDelete(id: number, actorId: number): Promise<void> {
		await this.db
			.update(users)
			.set(auditDelete(actorId))
			.where(this.liveWhere(eq(users.id, id)));
	}
}

function toFtsQuery(search: string): string {
	return `"${search.replace(/"/g, '""')}"`;
}

interface PegawaiRow {
	id: number;
	nip: string;
	nama: string;
	role: string;
	status: string;
	jabatan: string | null;
	peran: string | null;
	kategoriJabatan: string | null;
	kategoriKebutuhanJamPelatihan: string | null;
	bidangId: number;
	bidang: string;
	pangkatGolonganId: number | null;
	pangkatJenjang: string | null;
	pangkatNama: string | null;
	pangkatGolongan: string | null;
	pangkatRuang: string | null;
}

function toPegawai(row: PegawaiRow): Pegawai {
	return {
		id: row.id,
		nip: row.nip,
		nama: row.nama,
		role: row.role as Role,
		status: row.status as Status,
		jabatan: row.jabatan,
		peran: row.peran,
		kategoriJabatan: row.kategoriJabatan as KategoriJabatan | null,
		kategoriKebutuhanJamPelatihan:
			row.kategoriKebutuhanJamPelatihan as KategoriKebutuhanJamPelatihan | null,
		bidang: { id: row.bidangId, bidang: row.bidang },
		pangkatGolongan:
			row.pangkatGolonganId === null
				? null
				: {
						id: row.pangkatGolonganId,
						jenjang: row.pangkatJenjang ?? "",
						pangkat: row.pangkatNama ?? "",
						golongan: row.pangkatGolongan ?? "",
						ruang: row.pangkatRuang ?? "",
					},
	};
}
