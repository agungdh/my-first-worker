import { z } from "zod";

export const PangkatGolonganInputSchema = z.strictObject({
	jenjang: z.string().trim().min(1).max(100),
	pangkat: z.string().trim().min(1).max(150),
	golongan: z.string().trim().min(1).max(20),
	ruang: z.string().trim().min(1).max(20),
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
});
