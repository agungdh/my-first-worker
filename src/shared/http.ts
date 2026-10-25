import { z } from "zod";

export const success = <T>(result: T) => ({ success: true as const, ...result });

export const SuccessSchema = z.object({
	success: z.boolean(),
});