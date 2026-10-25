import { AwsClient } from "aws4fetch";
import {
	ALLOWED_IMAGE_TYPES,
	DOWNLOAD_URL_TTL_SECONDS,
	IMAGE_EXTENSIONS,
	IMAGE_KEY_PREFIX,
	UPLOAD_URL_TTL_SECONDS,
	type ImageContentType,
} from "./image.constants";

export interface R2Config {
	accountId: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
}

export class ImageStorage {
	private readonly endpoint: string;
	private readonly client: AwsClient | null;

	constructor(
		private readonly bucket: R2Bucket,
		config: R2Config,
	) {
		this.endpoint = `https://${config.bucket}.${config.accountId}.r2.cloudflarestorage.com`;
		this.client =
			config.accessKeyId && config.secretAccessKey
				? new AwsClient({
						accessKeyId: config.accessKeyId,
						secretAccessKey: config.secretAccessKey,
						service: "s3",
						region: "auto",
					})
				: null;
	}

	createKey(contentType: ImageContentType): string {
		return `${IMAGE_KEY_PREFIX}/${crypto.randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
	}

	async createUploadUrl(
		key: string,
		contentType: ImageContentType,
		size: number,
	): Promise<string> {
		const url = this.objectUrl(key);
		url.searchParams.set("X-Amz-Expires", String(UPLOAD_URL_TTL_SECONDS));

		const signed = await this.signer().sign(url.toString(), {
			method: "PUT",
			headers: { "Content-Type": contentType, "Content-Length": String(size) },
			aws: { signQuery: true, allHeaders: true },
		});

		return signed.url.toString();
	}

	async createDownloadUrl(key: string): Promise<string> {
		const url = this.objectUrl(key);
		url.searchParams.set("X-Amz-Expires", String(DOWNLOAD_URL_TTL_SECONDS));

		const signed = await this.signer().sign(url.toString(), {
			method: "GET",
			aws: { signQuery: true },
		});

		return signed.url.toString();
	}

	head(key: string): Promise<R2Object | null> {
		return this.bucket.head(key);
	}

	async remove(key: string): Promise<void> {
		await this.bucket.delete(key);
	}

	static contentTypeFromKey(key: string): ImageContentType {
		const extension = key.slice(key.lastIndexOf(".") + 1);
		return (
			ALLOWED_IMAGE_TYPES.find((type) => IMAGE_EXTENSIONS[type] === extension) ?? "image/jpeg"
		);
	}

	private objectUrl(key: string): URL {
		return new URL(`${this.endpoint}/${key}`);
	}

	private signer(): AwsClient {
		if (!this.client) throw new Error("R2 credentials are not configured");
		return this.client;
	}
}
