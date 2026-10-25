import { ConflictException, InputValidationException, NotFoundException } from "chanfana";
import { MAX_FILE_BYTES, MAX_FILE_LABEL, UPLOAD_URL_TTL_SECONDS } from "./file.constants";
import { FileRepository } from "./file.repository";
import { FileStorage } from "./file.storage";
import type {
	File,
	FileWithUrl,
	PresignFileInput,
	PresignedUpload,
	SaveFileInput,
} from "./file.domain";

export class FileService {
	constructor(
		private readonly repo: FileRepository,
		private readonly storage: FileStorage,
	) {}

	async presignUpload(input: PresignFileInput): Promise<PresignedUpload> {
		const key = this.storage.createKey();

		return {
			key,
			upload_url: await this.storage.createUploadUrl(key, input.content_type, input.size),
			method: "PUT",
			headers: { "Content-Type": input.content_type },
			expires_in: UPLOAD_URL_TTL_SECONDS,
		};
	}

	async list(page: number): Promise<FileWithUrl[]> {
		const files = await this.repo.list(page);

		return Promise.all(
			files.map(async (file) => ({
				...file,
				url: await this.storage.createDownloadUrl(file.key, file.filename),
			})),
		);
	}

	async get(id: number): Promise<FileWithUrl> {
		const file = await this.repo.findById(id);
		if (!file) throw new NotFoundException();

		return { ...file, url: await this.storage.createDownloadUrl(file.key, file.filename) };
	}

	async create(input: SaveFileInput): Promise<void> {
		const existing = await this.repo.findByKey(input.key);
		if (existing) throw new ConflictException();

		const stored = await this.readStoredFile(input.key);
		await this.repo.create({ ...input, ...stored });
	}

	async update(id: number, input: SaveFileInput): Promise<void> {
		const existing = await this.repo.findById(id);
		if (!existing) throw new NotFoundException();

		const replacing = input.key !== existing.key;
		let stored = { content_type: existing.content_type, size: existing.size };

		if (replacing) {
			const conflict = await this.repo.findByKey(input.key);
			if (conflict) throw new ConflictException();
			stored = await this.readStoredFile(input.key);
		}

		const updated = await this.repo.update(id, { ...input, ...stored });
		if (!updated) throw new NotFoundException();

		if (replacing) await this.storage.remove(existing.key);
	}

	async delete(id: number): Promise<FileWithUrl> {
		const file = await this.get(id);

		await this.repo.delete(id);
		await this.storage.remove(file.key);

		return file;
	}

	private async readStoredFile(
		key: string,
	): Promise<Pick<File, "content_type" | "size">> {
		const object = await this.storage.head(key);
		if (!object) {
			throw new InputValidationException("File was not uploaded to storage");
		}
		if (object.size > MAX_FILE_BYTES) {
			throw new InputValidationException(`File must not exceed ${MAX_FILE_LABEL}`);
		}

		return {
			content_type: object.content_type ?? "application/octet-stream",
			size: object.size,
		};
	}
}