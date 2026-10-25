import { z } from "zod";

export const TaskSchema = z.object({
	name: z.string().openapi({ example: "lorem" }),
	slug: z.string(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	due_date: z.iso.date(),
});

export const TaskUpdateSchema = z.strictObject({
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	completed: z.boolean(),
	due_date: z.iso.date(),
});
