import { ConflictException, NotFoundException } from "chanfana";
import { BidangRepository } from "./bidang.repository";
import type { Bidang, BidangInput } from "./bidang.domain";

export class BidangService {
	constructor(private readonly repo: BidangRepository) {}

	async list(page: number): Promise<Bidang[]> {
		return this.repo.list(page);
	}

	async get(id: number): Promise<Bidang> {
		const bidang = await this.repo.findById(id);
		if (!bidang) throw new NotFoundException("Bidang not found");

		return bidang;
	}

	async create(input: BidangInput, actorId: number): Promise<void> {
		if (await this.repo.existsByName(input.bidang)) {
			throw new ConflictException("Bidang already exists");
		}

		await this.repo.create(input, actorId);
	}

	async update(id: number, input: BidangInput, actorId: number): Promise<void> {
		await this.get(id);

		if (await this.repo.existsByName(input.bidang, id)) {
			throw new ConflictException("Bidang already exists");
		}

		await this.repo.update(id, input, actorId);
	}

	async remove(id: number, actorId: number): Promise<void> {
		await this.get(id);

		if ((await this.repo.countLivePegawai(id)) > 0) {
			throw new ConflictException("Bidang is still used by an active pegawai");
		}

		await this.repo.softDelete(id, actorId);
	}
}
