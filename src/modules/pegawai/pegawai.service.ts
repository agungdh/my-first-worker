import {
	ConflictException,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "chanfana";
import type { Page } from "../../shared/pagination";
import { BidangRepository } from "../bidang/bidang.repository";
import { PangkatGolonganRepository } from "../pangkat-golongan/pangkat-golongan.repository";
import { hashPassword, verifyPassword } from "./pegawai.password";
import { PegawaiRepository } from "./pegawai.repository";
import type {
	CreatePegawaiInput,
	LoginInput,
	Pegawai,
	PegawaiAuth,
	PegawaiFilter,
	UpdatePegawaiInput,
} from "./pegawai.domain";

export class PegawaiService {
	constructor(
		private readonly repo: PegawaiRepository,
		private readonly bidangRepo: BidangRepository,
		private readonly pangkatGolonganRepo: PangkatGolonganRepository,
	) {}

	async list(filter: PegawaiFilter): Promise<Page<Pegawai>> {
		return this.repo.list(filter);
	}

	async get(id: number): Promise<Pegawai> {
		const pegawai = await this.repo.findById(id);
		if (!pegawai) throw new NotFoundException("Pegawai not found");

		return pegawai;
	}

	async login(input: LoginInput): Promise<Pegawai> {
		const record = await this.repo.findAuthByNip(input.nip);
		if (!record || !(await verifyPassword(input.password, record.passwordHash))) {
			throw new UnauthorizedException();
		}
		if (record.status !== "aktif") throw new UnauthorizedException("Account is not active");

		return this.get(record.id);
	}

	/** Resolves the JWT `sub` claim into a live, active principal. */
	async principal(id: number): Promise<PegawaiAuth | null> {
		const record = await this.repo.findAuthById(id);
		if (!record || record.status !== "aktif") return null;

		return { id: record.id, nip: record.nip, nama: record.nama, role: record.role };
	}

	async create(input: CreatePegawaiInput, actorId: number): Promise<void> {
		if (await this.repo.findIdByNip(input.nip)) {
			throw new ConflictException("NIP already registered");
		}

		await this.assertRelations(input.bidangId, input.pangkatGolonganId ?? null);

		const password = input.password?.trim() || input.nip;

		await this.repo.create(
			{
				...input,
				pangkatGolonganId: input.pangkatGolonganId ?? null,
				jabatan: input.jabatan || null,
				peran: input.peran || null,
				kategoriJabatan: input.kategoriJabatan ?? null,
				kategoriKebutuhanJamPelatihan: input.kategoriKebutuhanJamPelatihan ?? null,
				passwordHash: await hashPassword(password),
			},
			actorId,
		);
	}

	async update(id: number, input: UpdatePegawaiInput, actorId: number): Promise<void> {
		await this.get(id);

		const nipOwner = await this.repo.findIdByNip(input.nip);
		if (nipOwner !== null && nipOwner !== id) {
			throw new ConflictException("NIP already registered");
		}

		await this.assertRelations(input.bidangId, input.pangkatGolonganId ?? null);

		const newPassword = input.password?.trim();

		await this.repo.update(
			id,
			{
				...input,
				pangkatGolonganId: input.pangkatGolonganId ?? null,
				jabatan: input.jabatan || null,
				peran: input.peran || null,
				kategoriJabatan: input.kategoriJabatan ?? null,
				kategoriKebutuhanJamPelatihan: input.kategoriKebutuhanJamPelatihan ?? null,
				passwordHash: newPassword ? await hashPassword(newPassword) : undefined,
			},
			actorId,
		);
	}

	async remove(id: number, actorId: number): Promise<void> {
		await this.get(id);
		await this.repo.softDelete(id, actorId);
	}

	private async assertRelations(bidangId: number, pangkatGolonganId: number | null): Promise<void> {
		if (!(await this.bidangRepo.findById(bidangId))) {
			throw new UnprocessableEntityException("Bidang not found");
		}

		if (pangkatGolonganId !== null && !(await this.pangkatGolonganRepo.findById(pangkatGolonganId))) {
			throw new UnprocessableEntityException("Pangkat golongan not found");
		}
	}
}
