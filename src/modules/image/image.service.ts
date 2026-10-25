import { ConflictException, InputValidationException, NotFoundException } from "chanfana";
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL, UPLOAD_URL_TTL_SECONDS } from "./image.constants";
import { ImageRepository } from "./image.repository";
import { ImageStorage } from "./image.storage";
import type {
	Image,
	ImageWithUrl,
	PresignImageInput,
	PresignedUpload,
	SaveImageInput,
} from "./image.domain";

export class ImageService {
	constructor(
		private readonly repo: ImageRepository,
		private readonly storage: ImageStorage,
	) {}

	async presignUpload(input: PresignImageInput): Promise<PresignedUpload> {
		const key = this.storage.createKey();

		return {
			key,
			upload_url: await this.storage.createUploadUrl(key, input.content_type, input.size),
			method: "PUT",
			headers: { "Content-Type": input.content_type },
			expires_in: UPLOAD_URL_TTL_SECONDS,
		};
	}

	async list(page: number): Promise<ImageWithUrl[]> {
		const images = await this.repo.list(page);

		return Promise.all(
			images.map(async (image) => ({
				...image,
				url: await this.storage.createDownloadUrl(image.key),
			})),
		);
	}

	async get(id: number): Promise<ImageWithUrl> {
		const image = await this.repo.findById(id);
		if (!image) throw new NotFoundException();

		return { ...image, url: await this.storage.createDownloadUrl(image.key) };
	}

	async create(input: SaveImageInput): Promise<ImageWithUrl> {
		const existing = await this.repo.findByKey(input.key);
		if (existing) throw new ConflictException();

		const stored = await this.readStoredImage(input.key);
		const image = await this.repo.create({ ...input, ...stored });

		return { ...image, url: await this.storage.createDownloadUrl(image.key) };
	}

	async update(id: number, input: SaveImageInput): Promise<ImageWithUrl> {
		const existing = await this.repo.findById(id);
		if (!existing) throw new NotFoundException();

		const replacing = input.key !== existing.key;
		let stored = { content_type: existing.content_type, size: existing.size };

		if (replacing) {
			const conflict = await this.repo.findByKey(input.key);
			if (conflict) throw new ConflictException();
			stored = await this.readStoredImage(input.key);
		}

		const image = await this.repo.update(id, { ...input, ...stored });
		if (!image) throw new NotFoundException();

		if (replacing) await this.storage.remove(existing.key);

		return { ...image, url: await this.storage.createDownloadUrl(image.key) };
	}

	async delete(id: number): Promise<ImageWithUrl> {
		const image = await this.get(id);

		await this.repo.delete(id);
		await this.storage.remove(image.key);

		return image;
	}

	private async readStoredImage(
		key: string,
	): Promise<Pick<Image, "content_type" | "size">> {
		const object = await this.storage.head(key);
		if (!object) {
			throw new InputValidationException("Image was not uploaded to storage");
		}
		if (object.size > MAX_IMAGE_BYTES) {
			throw new InputValidationException(`Image must not exceed ${MAX_IMAGE_LABEL}`);
		}

		return {
			content_type:
				object.content_type ?? ImageStorage.contentTypeFromKey(key),
			size: object.size,
		};
	}
}
