import { z } from "zod";
import {
	ALLOWED_IMAGE_TYPES,
	IMAGE_KEY_PATTERN,
	MAX_IMAGE_BYTES,
	MAX_IMAGE_LABEL,
} from "./image.constants";

export const ImagePresignSchema = z.strictObject({
	content_type: z.enum(ALLOWED_IMAGE_TYPES, {
		message: "Image must be JPEG, PNG or WebP",
	}).openapi({ example: "image/jpeg" }),
	size: z
		.number()
		.int()
		.min(1, { message: "Image size must be greater than 0" })
		.max(MAX_IMAGE_BYTES, { message: `Image must not exceed ${MAX_IMAGE_LABEL}` })
		.openapi({ example: 1048576, description: "Compressed image size in bytes" }),
});

export const ImageCreateSchema = z.strictObject({
	key: z.string().regex(IMAGE_KEY_PATTERN, { message: "Invalid image key" }),
	filename: z
		.string()
		.min(1, { message: "File name is required" })
		.max(255, { message: "File name must be 255 characters or fewer" }),
});

export const ImageUpdateSchema = ImageCreateSchema;

export const ImageSchema = z.object({
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
