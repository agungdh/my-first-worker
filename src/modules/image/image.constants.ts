export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const MAX_IMAGE_LABEL = "2 MB";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ImageContentType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const IMAGE_EXTENSIONS: Record<ImageContentType, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

export const IMAGE_KEY_PREFIX = "images";

export const IMAGE_KEY_PATTERN =
  /^images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const UPLOAD_URL_TTL_SECONDS = 600;

export const DOWNLOAD_URL_TTL_SECONDS = 60 * 60;