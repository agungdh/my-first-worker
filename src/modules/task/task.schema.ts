import { z } from "zod";

export const TaskSchema = z.object({
	name: z.string().openapi({ example: "lorem" }),
	slug: z.string(),
	description: z.string().optional(),
	completed: z.boolean().default(false),
	due_date: z.iso.date(),
});

export const TaskUpdateSchema = z.object({
	name: z.string().optional(),
	slug: z.string().optional(),
	description: z.string().optional(),
	completed: z.boolean().optional(),
	due_date: z.iso.date().optional(),
});
