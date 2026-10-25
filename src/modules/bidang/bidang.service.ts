import { ConflictException, NotFoundException } from "chanfana";
import { assertCursorValue, type Page } from "../../shared/pagination";
import { BidangRepository } from "./bidang.repository";
import type { Bidang, BidangFilter, BidangInput } from "./bidang.domain";

export class BidangService {
	constructor(private readonly repo: BidangRepository) {}

	async list(filter: BidangFilter): Promise<Page<Bidang>> {
		assertCursorValue(filter.cursor, filter.cursorValue, filter.sort === "id");

		return this.repo.list(filter);
	}

	async get(id: number): Promise<Bidang> {
		const bidang = await this.repo.findById(id);
		if (!bidang) throw new NotFoundException("Bidang not found");

		return bidang;
	}

	async create(input: BidangInput, actorId: number): Promise<void> {
		await this.repo.create(input, actorId);
	}

	async update(id: number, input: BidangInput, actorId: number): Promise<void> {
		await this.get(id);
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
