import { AwsClient } from "aws4fetch";
import {
	DOWNLOAD_URL_TTL_SECONDS,
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

export interface StoredObject {
	content_type: string | null;
	size: number;
}

export class ImageStorage {
	private readonly endpoint: string;
	private readonly client: AwsClient | null;

	constructor(config: R2Config) {
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

	createKey(): string {
		return `${IMAGE_KEY_PREFIX}/${crypto.randomUUID()}`;
	}
	async createUploadUrl(
		key: string,
		contentType: ImageContentType,
		size: number,
	): Promise<string> {
		const url = new URL(this.objectUrl(key));
		url.searchParams.set("X-Amz-Expires", String(UPLOAD_URL_TTL_SECONDS));

		const signed = await this.signer().sign(url.toString(), {
			method: "PUT",
			headers: { "Content-Type": contentType, "Content-Length": String(size) },
			aws: { signQuery: true, allHeaders: true },
		});

		return signed.url.toString();
	}

	async createDownloadUrl(key: string): Promise<string> {
		const url = new URL(this.objectUrl(key));
		url.searchParams.set("X-Amz-Expires", String(DOWNLOAD_URL_TTL_SECONDS));

		const signed = await this.signer().sign(url.toString(), {
			method: "GET",
			aws: { signQuery: true },
		});

		return signed.url.toString();
	}

	async head(key: string): Promise<StoredObject | null> {
		const response = await this.signer().fetch(this.objectUrl(key), { method: "HEAD" });

		if (response.status === 404) return null;
		if (!response.ok) {
			throw new Error(`R2 HEAD failed (HTTP ${response.status})`);
		}

		return {
			content_type: response.headers.get("content-type"),
			size: Number(response.headers.get("content-length") ?? 0),
		};
	}

	async remove(key: string): Promise<void> {
		const response = await this.signer().fetch(this.objectUrl(key), { method: "DELETE" });

		if (!response.ok && response.status !== 404) {
			throw new Error(`R2 DELETE failed (HTTP ${response.status})`);
		}
	}

	static contentTypeFromKey(_key: string): ImageContentType {
		return "image/jpeg";
	}

	private objectUrl(key: string): string {
		return `${this.endpoint}/${key}`;
	}

	private signer(): AwsClient {
		if (!this.client) throw new Error("R2 credentials are not configured");
		return this.client;
	}
}
