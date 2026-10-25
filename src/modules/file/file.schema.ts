import { z } from "zod";
import { FILE_KEY_PATTERN, MAX_FILE_BYTES, MAX_FILE_LABEL } from "./file.constants";

export const FilePresignSchema = z.strictObject({
	content_type: z.string().min(1, { message: "Content type is required" }).openapi({ example: "application/pdf" }),
	size: z
		.number()
		.int()
		.min(1, { message: "File size must be greater than 0" })
		.max(MAX_FILE_BYTES, { message: `File must not exceed ${MAX_FILE_LABEL}` })
		.openapi({ example: 1048576, description: "File size in bytes" }),
});

export const FileCreateSchema = z.strictObject({
	key: z.string().regex(FILE_KEY_PATTERN, { message: "Invalid file key" }),
	filename: z
		.string()
		.min(1, { message: "File name is required" })
		.max(255, { message: "File name must be 255 characters or fewer" }),
});

export const FileUpdateSchema = FileCreateSchema;

export const FileSchema = z.object({
	id: z.number(),
	key: z.string(),
	filename: z.string(),
	content_type: z.string(),
	size: z.number(),
	url: z.string(),
});

export const PresignedUploadSchema = z.object({
	key: z.string(),
	upload_url: z.string(),
	method: z.literal("PUT"),
	headers: z.record(z.string(), z.string()),
	expires_in: z.number(),
});