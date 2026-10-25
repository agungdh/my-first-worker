import { z } from "zod";
import { CursorSchema, SortOrderSchema } from "../../shared/pagination";

export const PangkatGolonganInputSchema = z.strictObject({
	jenjang: z.string().trim().min(1).max(100),
	pangkat: z.string().trim().min(1).max(150),
	golongan: z.string().trim().min(1).max(20),
	ruang: z.string().trim().min(1).max(20),
});

export const PangkatGolonganListQuerySchema = z.object({
	cursor: CursorSchema.optional().describe("Id of the last item from the previous page"),
	sort: z
		.enum(["id", "jenjang", "pangkat", "golongan", "ruang"])
		.default("id")
		.describe("Sort column"),
	order: SortOrderSchema.describe("Sort direction"),
});

export const PangkatGolonganSchema = z.object({
	id: z.number(),
	jenjang: z.string(),
	pangkat: z.string(),
	golongan: z.string(),
	ruang: z.string(),
});

export const PangkatGolonganListSchema = z.object({
	success: z.boolean(),
	pangkat_golongan: PangkatGolonganSchema.array(),
	next_cursor: z.number().nullable(),
	has_more: z.boolean(),
});
