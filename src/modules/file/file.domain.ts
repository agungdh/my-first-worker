export interface File {
	id: number;
	key: string;
	filename: string;
	content_type: string;
	size: number;
}

export interface FileWithUrl extends File {
	url: string;
}

export interface PresignFileInput {
	content_type: string;
	size: number;
}

export interface PresignedUpload {
	key: string;
	upload_url: string;
	method: "PUT";
	headers: Record<string, string>;
	expires_in: number;
}

export interface SaveFileInput {
	key: string;
	filename: string;
}