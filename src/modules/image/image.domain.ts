import type { ImageContentType } from "./image.constants";

export interface Image {
	id: number;
	key: string;
	filename: string;
	content_type: string;
	size: number;
}

export interface ImageWithUrl extends Image {
	url: string;
}

export interface PresignImageInput {
	content_type: ImageContentType;
	size: number;
}

export interface PresignedUpload {
	key: string;
	upload_url: string;
	method: "PUT";
	headers: Record<string, string>;
	expires_in: number;
}

export interface SaveImageInput {
	key: string;
	filename: string;
}
