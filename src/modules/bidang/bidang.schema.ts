import { z } from "zod";

export const BidangInputSchema = z.strictObject({
	bidang: z.string().trim().min(1).max(255),
});

export const BidangSchema = z.object({
	id: z.number(),
	bidang: z.string(),
});

export const BidangListSchema = z.object({
	success: z.boolean(),
	bidang: BidangSchema.array(),
});
