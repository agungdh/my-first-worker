import { z } from "zod";
import { CursorSchema, SortOrderSchema } from "../../shared/pagination";

export const BidangInputSchema = z.strictObject({
	bidang: z.string().trim().min(1).max(255),
});

export const BidangListQuerySchema = z.object({
	cursor: CursorSchema.optional().describe("Id of the last item from the previous page"),
	sort: z.enum(["id", "bidang"]).default("id").describe("Sort column (default id)"),
	order: SortOrderSchema.describe("Sort direction (default desc)"),
});

export const BidangSchema = z.object({
	id: z.number(),
	bidang: z.string(),
});

export const BidangListSchema = z.object({
	success: z.boolean(),
	bidang: BidangSchema.array(),
	next_cursor: z.number().nullable(),
	has_more: z.boolean(),
});
