import { ConflictException, NotFoundException } from "chanfana";
import { PangkatGolonganRepository } from "./pangkat-golongan.repository";
import type { PangkatGolongan, PangkatGolonganInput } from "./pangkat-golongan.domain";

export class PangkatGolonganService {
	constructor(private readonly repo: PangkatGolonganRepository) {}

	async list(page: number): Promise<PangkatGolongan[]> {
		return this.repo.list(page);
	}

	async get(id: number): Promise<PangkatGolongan> {
		const pangkatGolongan = await this.repo.findById(id);
		if (!pangkatGolongan) throw new NotFoundException("Pangkat golongan not found");

		return pangkatGolongan;
	}

	async create(input: PangkatGolonganInput, actorId: number): Promise<void> {
		await this.repo.create(input, actorId);
	}

	async update(id: number, input: PangkatGolonganInput, actorId: number): Promise<void> {
		await this.get(id);
		await this.repo.update(id, input, actorId);
	}

	async remove(id: number, actorId: number): Promise<void> {
		await this.get(id);

		if ((await this.repo.countLivePegawai(id)) > 0) {
			throw new ConflictException("Pangkat golongan is still used by an active pegawai");
		}

		await this.repo.softDelete(id, actorId);
	}
}
